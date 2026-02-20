import express from "express"
import cors from "cors"
import { userRouter } from "./routes/user";

const app = express();
app.use(express.json({ limit: "10mb" }));
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || "*",
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    app.get("/", (req, res) => {
        res.send("Hola amigos");
    })

    app.use("/api/user", userRouter);



app.listen(8080, () => console.log("API running on port 8080"));