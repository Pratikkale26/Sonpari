import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { prisma } from "db/client";
import { generateKycHash, createOroUser, signAndSubmit } from "../oroApi";

const router = Router();


router.post("/create-oro", authMiddleware, async (req, res) => {
    try {
        const userId = req.id!;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.grailUserId) return res.status(400).json({ message: "Oro account already created" });
        if (!user.name) return res.status(400).json({ message: "Please complete your profile (name required) before activating" });

        // Check env vars early
        if (!process.env.ORO_API_KEY) {
            return res.status(500).json({ message: "ORO_API_KEY is not configured on the server. Please add it to apps/api/.env" });
        }

        // Generate KYC hash from email + name
        const kycHash = generateKycHash({ email: user.email, name: user.name });

        // Create user on Oro
        const oroData = await createOroUser(kycHash);

        // Sign + submit the Oro transaction
        await signAndSubmit(oroData.transaction);

        // Save grailUserId and kycHash
        await prisma.user.update({
            where: { id: userId },
            data: { grailUserId: oroData.userPda, kycHash, kycStatus: "VERIFIED" },
        });

        return res.json({ message: "Oro account activated!", grailUserId: oroData.userPda });
    } catch (err: any) {
        const oroMsg = err?.response?.data?.message || err?.response?.data?.error;
        const msg = oroMsg || err?.message || "Failed to create Oro account";
        console.error("create-oro error:", err?.response?.data || err?.message);
        return res.status(500).json({ message: msg });
    }
});

export { router as oroUserRouter };
