import webpush from "web-push";
import { prisma } from "db/client";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@sonpari.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToUser(userId: string, title: string, body: string, url = "/dashboard") {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushSubscription: true },
        });
        if (!user?.pushSubscription) return;

        const subscription = JSON.parse(user.pushSubscription as string);
        await webpush.sendNotification(
            subscription,
            JSON.stringify({ title, body, url })
        );
    } catch (err: any) {
        // If the subscription is expired/invalid, clear it
        if (err?.statusCode === 410 || err?.statusCode === 404) {
            await prisma.user.update({
                where: { id: userId },
                data: { pushSubscription: null },
            });
        }
        console.error("Push failed for user", userId, err?.message);
    }
}

export async function sendPushToMany(userIds: string[], title: string, body: string, url = "/dashboard") {
    await Promise.allSettled(userIds.map(uid => sendPushToUser(uid, title, body, url)));
}
