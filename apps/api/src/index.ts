import express from "express"
import cors from "cors"
import { userRouter } from "./routes/user";
import { goldRouter } from "./routes/gold";
import { groupRouter } from "./routes/group";

const app = express();
app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sonpari-web-kvhc.vercel.app",
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

app.listen(8080, () => console.log("API running on port 8080"));