const express = require("express");
import { Request, Response } from "express";
const router = express.Router();
const User = require("../models/User"); // Mongoose model

// async function storeUserData(req: any, res: any) {
//   try {
//     const { name, email } = req.body;
//     const newUser = new User({ name, email });
//     await newUser.save();
//     res.status(201).json({ message: "User data stored successfully" });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : String(err);
//     res.status(500).json({ message });
//   }
// }

// router.post("/store-user", storeUserData);

router.put("/users", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and encryptedPassword are required" });
    }
    const bcrypt = require("bcryptjs"); //hash the password before storing
    const encryptedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = new User({ email, password: encryptedPassword });
    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password; // don't return password
    return res.status(201).json({ message: "User created", user: userObj });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

router.post("/users/authenticate", async (req: Request, res: Response) => {
  //send over the encrypted version of the password entered - if it matches the curent stored encrypted password, authenticate
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and encryptedPassword are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password); //checks the hash of the attempted password against the stored hash
    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    return res.status(200).json({ message: "Authentication successful" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});

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

router.getLocationInfoByName,
  async (req: Request, res: Response) => {
    const locationName = req.query.name as string;
    // Implement logic to fetch location info by name
    res.json({ info: `Info for location: ${locationName}` });
  };

router.getLocationsNearby,
  async (req: Request, res: Response) => {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    // Implement logic to fetch nearby locations based on latitude and longitude
    res.json({
      locations: [
        `Location1 near (${latitude}, ${longitude})`,
        `Location2 near (${latitude}, ${longitude})`,
      ],
    });
  };

router.get("/");

module.exports = router;

export default router;
