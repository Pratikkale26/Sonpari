import express from "express"
import cors from "cors"
import cron from "node-cron";
import { userRouter } from "./routes/user";
import { goldRouter } from "./routes/gold";
import { groupRouter } from "./routes/group";
import { notificationRouter } from "./routes/notifications";
import { prisma } from "db/client";

const app = express();
app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sonpari-web.vercel.app",
    "https://sonpari.xyz",
    process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === "*") {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.get("/", (req, res) => { res.send("Sonpari API 🌟"); });

app.use("/api/user", userRouter);
app.use("/api/gold", goldRouter);
app.use("/api/groups", groupRouter);
app.use("/api/notifications", notificationRouter);
// Every hour: notify users whose last save was 24-34hrs ago (streak at risk)
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        const min24h = new Date(now.getTime() - 34 * 60 * 60 * 1000);
        const max24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const atRiskStreaks = await prisma.streak.findMany({
            where: {
                lastSaveDate: { gte: min24h, lte: max24h },
                currentStreak: { gt: 0 },
            },
            select: { userId: true, currentStreak: true },
        });

        console.log(`[cron] Creating streak reminder notifications for ${atRiskStreaks.length} users`);

        if (atRiskStreaks.length > 0) {
            await (prisma as any).notification.createMany({
                data: atRiskStreaks.map((s: any) => ({
                    userId: s.userId,
                    type: "STREAK_REMINDER",
                    title: "⚡ Your streak is at risk!",
                    body: `Save gold now to keep your ${s.currentStreak}-day streak alive! 🔥`,
                    link: "/buy",
                })),
                skipDuplicates: true,
            });
        }
    } catch (err) {
        console.error("[cron] Streak reminder error:", err);
    }
});

app.listen(8080, () => console.log("API running on port 8080"));
