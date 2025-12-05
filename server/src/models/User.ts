const mongoose = require("mongoose");

// Ensure ATLAS_URI is available when this file is required
const uri = process.env.ATLAS_URI;
if (uri) {
  mongoose.connect(uri).catch((err: any) => {
    console.error("Mongoose connection error:", err);
  });
} else {
  console.warn(
    "ATLAS_URI not set; Mongoose will not connect until ATLAS_URI is provided."
  );
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    history: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
