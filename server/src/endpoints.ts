const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Mongoose model

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
