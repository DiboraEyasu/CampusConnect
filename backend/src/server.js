
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();

    // Start Express only after the database is connected
    const server = app.listen(PORT, () => {
      console.log(`CampusConnect API is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
      } else {
        console.error("Server error:", error.message);
      }

      process.exitCode = 1;
    });
  } catch (error) {
    console.error("CampusConnect startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
