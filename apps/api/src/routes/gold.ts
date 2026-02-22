import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { prisma } from "db/client";
import { purchaseGoldForUser, signAndSubmit } from "../oroApi";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const router = Router();

const STREAK_RESET_HOURS = 36;

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const MILESTONE_NAMES: Record<number, { name: string; emoji: string }> = {
    3: { name: "Starter", emoji: "🥉" },
    7: { name: "Week Warrior", emoji: "🥈" },
    14: { name: "Fortnight Saver", emoji: "🥇" },
    30: { name: "Diamond Hands", emoji: "💎" },
    60: { name: "Gold Legend", emoji: "🌟" },
    100: { name: "Sonpari Elite", emoji: "👑" },
};

async function updateStreak(userId: string) {
    const now = new Date();
    const streak = await prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
        await prisma.streak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastSaveDate: now } });
        await prisma.user.update({ where: { id: userId }, data: { streakCount: 1, lastSaveDate: now } });
        return;
    }

    const hoursSinceLast = streak.lastSaveDate
        ? (now.getTime() - streak.lastSaveDate.getTime()) / (1000 * 60 * 60)
        : 999;

    const newCurrent = hoursSinceLast <= STREAK_RESET_HOURS ? streak.currentStreak + 1 : 1;
    const newLongest = Math.max(newCurrent, streak.longestStreak);

    await prisma.streak.update({
        where: { userId },
        data: { currentStreak: newCurrent, longestStreak: newLongest, lastSaveDate: now },
    });
    await prisma.user.update({ where: { id: userId }, data: { streakCount: newCurrent, lastSaveDate: now } });

    // Fire milestone notification when a threshold is crossed
    if (STREAK_MILESTONES.includes(newCurrent)) {
        const m = MILESTONE_NAMES[newCurrent];
        if (m) {
            await (prisma as any).notification.create({
                data: {
                    userId,
                    type: "STREAK_MILESTONE",
                    title: `${m.emoji} Badge Unlocked: ${m.name}!`,
                    body: `You've hit a ${newCurrent}-day saving streak. Keep it going!`,
                    link: "/badges",
                },
            });
        }
    }
}

// GET /api/gold/price
router.get("/price", authMiddleware, async (_req: Request, res: Response) => {
    // Approximate: 1g gold ≈ $74 USDC, $1 = ₹83
    const usdcPerGram = 74;
    const inrPerGram = usdcPerGram * 83;
    return res.json({ usdcPerGram, inrPerGram, currency: "USDC" });
});

// POST /api/gold/buy
// Body: { goldGrams: number, paymentTxSignature: string }
// Flow: Verify USDC payment to parent wallet → call Oro buy → sign + submit → record + streak
router.post("/buy", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const { goldGrams, paymentTxSignature } = req.body;

        if (!goldGrams || Number(goldGrams) <= 0) {
            return res.status(400).json({ message: "Invalid gold amount" });
        }
        if (!paymentTxSignature) {
            return res.status(400).json({ message: "Payment transaction signature required" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.grailUserId) {
            return res.status(400).json({ message: "Please activate your Oro account first" });
        }

        // Verify Solana payment
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const txInfo = await connection.getTransaction(paymentTxSignature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        if (!txInfo || txInfo.meta?.err) {
            return res.status(400).json({ message: "Payment transaction not confirmed or failed on Solana" });
        }

        // Purchase via Oro
        const purchaseData = await purchaseGoldForUser(user.grailUserId, Number(goldGrams));
        const txResult = await signAndSubmit(purchaseData.transaction.serializedTx);

        // Save record
        await prisma.savingsTransaction.create({
            data: {
                userId,
                grailTxnId: txResult.txId,
                goldGrams: Number(goldGrams),
                goldPriceAtTxn: purchaseData.quotedGoldPrice,
                type: "SAVE",
            },
        });

        // Update streak
        await updateStreak(userId);

        return res.json({
            message: "Gold purchased successfully! 🎉",
            txId: txResult.txId,
            goldGrams: purchaseData.goldAmount,
            quotedPrice: purchaseData.quotedGoldPrice,
            quoteUsdc: purchaseData.quoteUsdcAmount,
        });
    } catch (err: any) {
        console.error("buy error:", err?.response?.data || err.message);
        return res.status(500).json({ message: err?.response?.data?.message || "Failed to purchase gold" });
    }
});

// GET /api/gold/history — Transaction history for current user
router.get("/history", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const transactions = await prisma.savingsTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return res.json({ transactions });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch history" });
    }
});

// GET /api/gold/leaderboard — Top 20 users by streak
router.get("/leaderboard", authMiddleware, async (req: Request, res: Response) => {
    try {
        // Get top users with their streaks and total gold
        const topStreaks = await prisma.streak.findMany({
            orderBy: { longestStreak: "desc" },
            take: 20,
            include: {
                user: {
                    select: { id: true, name: true, email: true, streakCount: true },
                },
            },
        });

        // Get total gold per user
        const totals = await prisma.savingsTransaction.groupBy({
            by: ["userId"],
            _sum: { goldGrams: true },
            where: {
                userId: { in: topStreaks.map((s: any) => s.userId) },
            },
        });

        const totalsMap = Object.fromEntries(totals.map(t => [t.userId, Number(t._sum.goldGrams || 0)]));

        const leaderboard = topStreaks.map((s: any, i: number) => ({
            rank: i + 1,
            userId: s.userId,
            name: s.user.name || s.user.email.split("@")[0],
            currentStreak: s.user.streakCount,
            longestStreak: s.longestStreak,
            totalGoldGrams: totalsMap[s.userId] || 0,
        }));

        return res.json({ leaderboard });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
});

export { router as goldRouter };
