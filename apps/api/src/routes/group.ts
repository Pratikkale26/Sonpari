import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { prisma } from "db/client";
import { nanoid } from "nanoid";

const router = Router();

function isAdmin(role: string) {
    return role === "ADMIN";
}

// ─── POST /api/groups — Create group ────────────────────────────────────────
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Group name required" });

        const inviteCode = nanoid(8).toUpperCase();
        const group = await prisma.group.create({
            data: {
                name,
                description,
                inviteCode,
                members: {
                    create: { userId, role: "ADMIN" as any },
                },
            },
            include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
        });

        return res.json({ message: "Group created!", group });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create group" });
    }
});

// ─── POST /api/groups/join — Join via invite code ────────────────────────────
router.post("/join", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const { inviteCode } = req.body;
        if (!inviteCode) return res.status(400).json({ message: "Invite code required" });

        const group = await prisma.group.findUnique({ where: { inviteCode: (inviteCode as string).toUpperCase() } });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const existing = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId: group.id, userId } },
        });
        if (existing) return res.status(400).json({ message: "Already a member" });

        await prisma.groupMember.create({ data: { groupId: group.id, userId, role: "MEMBER" as any } });
        return res.json({ message: "Joined group!", groupId: group.id, groupName: group.name });
    } catch (err) {
        return res.status(500).json({ message: "Failed to join group" });
    }
});

// ─── GET /api/groups — List my groups ────────────────────────────────────────
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const memberships = await prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        members: { include: { user: { select: { id: true, name: true, email: true } } } },
                    },
                },
            },
        });
        return res.json({ groups: memberships.map((m: any) => ({ ...m.group, myRole: m.role })) });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch groups" });
    }
});

// ─── GET /api/groups/:id — Group detail ─────────────────────────────────────
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;

        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!membership) return res.status(403).json({ message: "Not a member of this group" });

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true, streakCount: true } } },
                    orderBy: { joinedAt: "asc" },
                },
            },
        });

        // Fetch proposals separately (after prisma generate relation will be inline)
        const proposals = await (prisma as any).groupProposal.findMany({
            where: { groupId },
            include: {
                contributions: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ group: { ...group, proposals }, myRole: membership.role });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch group" });
    }
});

// ─── POST /api/groups/:id/promote — Promote a member to admin ───────────────
router.post("/:id/promote", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;
        const { targetUserId } = req.body;

        const myMembership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!myMembership || !isAdmin(myMembership.role as string)) {
            return res.status(403).json({ message: "Only admins can promote members" });
        }

        await prisma.groupMember.update({
            where: { groupId_userId: { groupId, userId: targetUserId } },
            data: { role: "ADMIN" as any },
        });
        return res.json({ message: "Member promoted to admin!" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to promote member" });
    }
});

// ─── POST /api/groups/:id/proposals — Admin creates group buy proposal ───────
router.post("/:id/proposals", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;
        const { occasion, message, deadline } = req.body;

        const myMembership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!myMembership || !isAdmin(myMembership.role as string)) {
            return res.status(403).json({ message: "Only admins can create proposals" });
        }

        const proposal = await (prisma as any).groupProposal.create({
            data: {
                groupId,
                createdBy: userId,
                occasion,
                message,
                deadline: deadline ? new Date(deadline) : undefined,
            },
        });
        return res.json({ message: "Proposal created!", proposal });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create proposal" });
    }
});

// ─── GET /api/groups/:id/proposals/:pid — Proposal detail ───────────────────
router.get("/:id/proposals/:pid", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;
        const proposalId = req.params.pid as string;

        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!membership) return res.status(403).json({ message: "Not a member" });

        const proposal = await (prisma as any).groupProposal.findUnique({
            where: { id: proposalId },
            include: {
                contributions: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        if (!proposal) return res.status(404).json({ message: "Proposal not found" });

        return res.json({ proposal, myRole: membership.role });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch proposal" });
    }
});

// ─── POST /api/groups/:id/proposals/:pid/contribute ──────────────────────────
// Called after a member individually buys gold — records their contribution.
router.post("/:id/proposals/:pid/contribute", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;
        const proposalId = req.params.pid as string;
        const { goldGrams, grailTxnId } = req.body;

        const membership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!membership) return res.status(403).json({ message: "Not a member" });

        const proposal = await (prisma as any).groupProposal.findUnique({ where: { id: proposalId } });
        if (!proposal || proposal.status !== "OPEN") {
            return res.status(400).json({ message: "Proposal is closed" });
        }

        // Upsert — one contribution per user per proposal
        const existing = await (prisma as any).proposalContribution.findFirst({
            where: { proposalId, userId },
        });

        let contribution;
        if (existing) {
            contribution = await (prisma as any).proposalContribution.update({
                where: { id: existing.id },
                data: { goldGrams, grailTxnId, status: "PAID", paidAt: new Date() },
            });
        } else {
            contribution = await (prisma as any).proposalContribution.create({
                data: {
                    proposalId,
                    userId,
                    goldGrams,
                    grailTxnId: grailTxnId || null,
                    status: grailTxnId ? "PAID" : "PLEDGED",
                    paidAt: grailTxnId ? new Date() : undefined,
                },
            });
        }

        return res.json({ message: "Contribution recorded!", contribution });
    } catch (err) {
        return res.status(500).json({ message: "Failed to record contribution" });
    }
});

// ─── POST /api/groups/:id/proposals/:pid/close — Admin closes proposal ───────
router.post("/:id/proposals/:pid/close", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const groupId = req.params.id as string;
        const proposalId = req.params.pid as string;

        const myMembership = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!myMembership || !isAdmin(myMembership.role as string)) {
            return res.status(403).json({ message: "Only admins can close proposals" });
        }

        await (prisma as any).groupProposal.update({
            where: { id: proposalId },
            data: { status: "CLOSED" },
        });
        return res.json({ message: "Proposal closed!" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to close proposal" });
    }
});

export { router as groupRouter };
