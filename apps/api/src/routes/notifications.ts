import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { prisma } from "db/client";

const router = Router();

// GET /api/notifications — list my notifications, newest first
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        const notifications = await (prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 30,
        });
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        return res.json({ notifications, unreadCount });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// POST /api/notifications/read-all — mark all as read
router.post("/read-all", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        await (prisma as any).notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return res.json({ message: "All marked as read" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to mark as read" });
    }
});

// POST /api/notifications/:id/read — mark one as read
router.post("/:id/read", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.id!;
        await (prisma as any).notification.updateMany({
            where: { id: req.params.id, userId },
            data: { read: true },
        });
        return res.json({ message: "Marked as read" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to mark as read" });
    }
});

export { router as notificationRouter };
