const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CampusConnect API is running healthy"
  });
});

app.listen(PORT, () => {
    console.log(`Campus Connect is running on port ${PORT}`);
});