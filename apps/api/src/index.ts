import express from "express"
import cors from "cors"
import { prisma } from "db/client";

const app = express();
app.use(express.json({ limit: "10mb" }));
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    app.get("/", (req, res) => {
        res.send("Hola amigos");
    })

    app.post("/user", async (req, res) => {
        const { username, password } = req.body

        const user = await prisma.user.create({
            data: {
                username: username,
                password: password
            }
        })

        return res.status(200).json({
            success: true,
            user
        })
    })




app.listen(3000, () => console.log("API running on port 3000"));