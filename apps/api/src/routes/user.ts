
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
    await signAndSubmit(oroData.transaction.serializedTx);

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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

// POST /api/user/push-subscribe — Save browser push subscription
router.post("/push-subscribe", authMiddleware, async (req, res) => {
  try {
    const userId = req.id!;
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: "Subscription required" });
    await prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: JSON.stringify(subscription) },
    });
    return res.json({ message: "Push subscription saved" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save subscription" });
  }
});

// GET /api/user/badges — Return earned streak badges
router.get("/badges", authMiddleware, async (req, res) => {
  try {
    const userId = req.id!;
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const longest = streak?.longestStreak || 0;
    const MILESTONES = [
      { streak: 3, name: "Starter", emoji: "🥉" },
      { streak: 7, name: "Week Warrior", emoji: "🥈" },
      { streak: 14, name: "Fortnight Saver", emoji: "🥇" },
      { streak: 30, name: "Diamond Hands", emoji: "💎" },
      { streak: 60, name: "Gold Legend", emoji: "🌟" },
      { streak: 100, name: "Sonpari Elite", emoji: "👑" },
    ];
    const badges = MILESTONES.map(m => ({
      ...m,
      earned: longest >= m.streak,
    }));
    return res.json({ badges, longestStreak: longest, currentStreak: streak?.currentStreak || 0 });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch badges" });
  }
});

export const userRouter = router;