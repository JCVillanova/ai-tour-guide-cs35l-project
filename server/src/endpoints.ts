const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Mongoose model

async function storeUserData(req: any, res: any) {
  try {
    const { name, email } = req.body;
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json({ message: "User data stored successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
}

router.post("/store-user", storeUserData);

router.get("/users", async (req: any, res: any) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message });
  }
});

module.exports = router;
