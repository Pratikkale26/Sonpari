
import { Router } from "express";
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middlewares/authMiddleware";
import { prisma } from "db/client";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing email or password" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: email,
        password: password,
      },
    });

    return res.status(200).json({ message: "Signed up successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
})


router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing email or password" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // sign the jwt
    const token = jwt.sign({
      id: user.id
    }, process.env.JWT_SECRET!);

    res.status(200).json({
      message: "Signed in successfully!",
      token: token,
    });
    return;

  } catch (err) {
    console.error("Signin error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
})

router.post("/profile", authMiddleware, async (req, res) => {
  const id = req.id;
  const { name, password, phone } = req.body;
  const user = await prisma.user.update({
    where: {
      id
    },
    data: {
      name,
      phone,
      password
    }
  });
  return res.json({
    user
  });
})

router.get("/", authMiddleware, async (req, res) => {
  const id = req.id;
  const user = await prisma.user.findFirst({
    where: {
      id
    }
  });

  return res.json({
    user
  });
})

export const userRouter = router;