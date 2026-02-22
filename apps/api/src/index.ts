import express from "express"
import cors from "cors"
import cron from "node-cron";
import { userRouter } from "./routes/user";
import { goldRouter } from "./routes/gold";
import { groupRouter } from "./routes/group";
import { prisma } from "db/client";
import { sendPushToUser } from "./pushService";

const app = express();
app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sonpari-web.vercel.app",
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

// Every hour: find users whose last save was 24-34hrs ago → remind before streak breaks
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

        console.log(`[cron] Sending streak reminders to ${atRiskStreaks.length} users`);

        for (const s of atRiskStreaks) {
            await sendPushToUser(
                s.userId,
                "⚡ Your streak is at risk!",
                `Save gold now to keep your ${s.currentStreak} day streak alive! 🔥`,
                "/buy"
            );
        }
    } catch (err) {
        console.error("[cron] Streak reminder error:", err);
    }
});

app.listen(8080, () => console.log("API running on port 8080"));
