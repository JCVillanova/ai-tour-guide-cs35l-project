import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import endpoints from "./endpoints";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/", endpoints);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AI Tour Guide API" });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.ATLAS_URI || "");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Collections in database:",
      collections.map((c) => c.name)
    ); //using this debug line to test if it is actually connecting to the db
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

startServer();
