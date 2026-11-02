const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authenticate, createEvent);
router.patch("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

module.exports = router;
