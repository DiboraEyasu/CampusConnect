const mongoose = require("mongoose");
const Event = require("../models/Event");

const allowedFields = ["title", "description", "location", "startAt", "endAt", "category", "imageUrl"];

function validImageUrl(value) {
  if (value === undefined || value === "") return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateEventInput(body, { partial = false } = {}) {
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const required = ["title", "description", "location", "startAt", "endAt"];
  if (!partial) {
    for (const field of required) {
      if (data[field] === undefined || data[field] === "") {
        return { error: `${field} is required.` };
      }
    }
  }

  for (const field of ["title", "description", "location", "category", "imageUrl"]) {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      return { error: `${field} must be text.` };
    }
  }
  if (data.title !== undefined && data.title.trim().length < 3) return { error: "Title must be at least 3 characters." };
  if (data.description !== undefined && data.description.trim().length < 10) return { error: "Description must be at least 10 characters." };
  if (data.location !== undefined && !data.location.trim()) return { error: "Location cannot be empty." };
  if (data.category !== undefined && !["academic", "career", "social", "sports", "workshop", "other"].includes(data.category)) {
    return { error: "Invalid event category." };
  }
  if (!validImageUrl(data.imageUrl)) return { error: "imageUrl must be a valid HTTP or HTTPS URL." };

  for (const field of ["startAt", "endAt"]) {
    if (data[field] !== undefined) {
      const date = new Date(data[field]);
      if (Number.isNaN(date.getTime())) return { error: `${field} must be a valid date.` };
      data[field] = date;
    }
  }

  if (data.startAt && data.endAt && data.endAt <= data.startAt) {
    return { error: "Event end must be after its start." };
  }
  return { data };
}

async function getEvents(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page ?? "1", 10);
    const limit = Number.parseInt(req.query.limit ?? "10", 10);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ status: "error", message: "page must be >= 1 and limit must be between 1 and 50." });
    }

    const filter = {};
    if (req.query.upcoming === "true") filter.startAt = { $gte: new Date() };
    if (req.query.category) filter.category = req.query.category;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("organizer", "name avatarUrl"),
      Event.countDocuments(filter)
    ]);

    res.json({ status: "success", data: { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid event ID." });
    }
    const event = await Event.findById(req.params.id).populate("organizer", "name avatarUrl");
    if (!event) return res.status(404).json({ status: "error", message: "Event not found." });
    res.json({ status: "success", data: { event } });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const result = validateEventInput(req.body);
    if (result.error) return res.status(400).json({ status: "error", message: result.error });

    const event = await Event.create({ ...result.data, organizer: req.userId });
    const populated = await event.populate("organizer", "name avatarUrl");
    res.status(201).json({ status: "success", message: "Event created.", data: { event: populated } });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ status: "error", message: "Invalid event ID." });
    const result = validateEventInput(req.body, { partial: true });
    if (result.error) return res.status(400).json({ status: "error", message: result.error });
    if (!Object.keys(result.data).length) return res.status(400).json({ status: "error", message: "Provide at least one supported field to update." });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ status: "error", message: "Event not found." });
    if (String(event.organizer) !== req.userId) return res.status(403).json({ status: "error", message: "Only the event organizer can update this event." });

    Object.assign(event, result.data);
    if (event.endAt <= event.startAt) return res.status(400).json({ status: "error", message: "Event end must be after its start." });
    await event.save();
    await event.populate("organizer", "name avatarUrl");
    res.json({ status: "success", message: "Event updated.", data: { event } });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ status: "error", message: "Invalid event ID." });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ status: "error", message: "Event not found." });
    if (String(event.organizer) !== req.userId) return res.status(403).json({ status: "error", message: "Only the event organizer can delete this event." });
    await event.deleteOne();
    res.json({ status: "success", message: "Event deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
