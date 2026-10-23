const mongoose = require("mongoose");
const express = require("express");

const authRoutes = require("./routes/authroutes");

const app = express();

// 1. Parse incoming JSON request bodies
app.use(express.json({limit: "10kb"}));

// 2. Health-check endpoint
app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "success" : "error",
    message: databaseConnected
      ? "CampusConnect API is running healthy"
      : "Database connection is unavailable",
    database: databaseConnected ? "connected" : "disconnected"
  });
});

// 3. Authentication routes
app.use("/api/auth", authRoutes);

// 4. Handle requests to endpoints that do not exist
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 4. Export the configured Express application
module.exports = app;
