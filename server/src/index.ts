import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AI Tour Guide API" });
});

// Require endpoints after dotenv has run so models can read ATLAS_URI
const endpoints = require("./endpoints");
app.use("/", endpoints);

// Start server with robust error handling and bind to all interfaces
const PORT = Number(process.env.PORT || 5000);
const server = app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(
      `Your Windows IP (from ipconfig) will replace 0.0.0.0 when accessed from other devices`
    );
  })
  .on("error", (err: Error) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  });

export default server;
