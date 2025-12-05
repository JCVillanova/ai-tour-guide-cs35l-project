import express, { Request, Response } from "express";
import User, { TourRecord } from "./models/User";

const router = express.Router();

// CREATE user
router.put("/users", async (req: Request, res: Response) => {
  console.log("Received request to create user:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password in request body");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const bcrypt = require("bcryptjs"); // hash the password before storing
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log("Encrypted password:", encryptedPassword);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User with this email already exists:", email);
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = new User({ email, password: encryptedPassword, history: [] });
    await newUser.save();
    console.log("User created successfully:", email);

    const userObj = newUser.toObject();
    delete (userObj as any).password; // don't return password
    return res.status(201).json({ message: "User created", user: userObj });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

// AUTHENTICATE user
router.post("/users/authenticate", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password); // compares hash
    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    return res.status(200).json({ message: "Authentication successful" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

// LIST all users (debug)
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});

// DELETE user by id
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});

// (Optional) OLD history by id routes – you can keep or delete if not using:
/*
router.put("/users/:id/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { history } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.history = history;
    await user.save();
    res.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});

router.get("/users/:id/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ history: user.history });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});
*/

// 🔹 NEW: get history by email (used by getHistory(email))
router.get("/user-history", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string | undefined;
    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ history: user.history ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

// 🔹 NEW: append a tour record to user's history by email
router.post("/user-history", async (req: Request, res: Response) => {
  try {
    const { email, record } = req.body as {
      email?: string;
      record?: TourRecord;
    };
    if (!email || !record) {
      return res
        .status(400)
        .json({ message: "email and record are required in body" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.history)) {
      user.history = [];
    }

    user.history.push(record);
    await user.save();

    return res
      .status(201)
      .json({ message: "History updated", history: user.history });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

export default router;
