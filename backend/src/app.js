const mongoose = require("mongoose");
const express = require("express");

const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");

const app = express();

// Allow requests from our Vite frontend during development
app.use((req, res, next) => {
  const allowedOrigin = "http://localhost:5173";

  res.setHeader("Vary", "Origin");

  if (req.headers.origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle browser preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Parse incoming JSON request bodies
app.use(express.json({ limit: "10kb" }));


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
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", likeRoutes);
app.use("/api", commentRoutes);


// 4. Handle requests to endpoints that do not exist
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});



// 4. Export the configured Express application
module.exports = app;
