const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"]
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"]
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"]
    },
    startAt: {
      type: Date,
      required: [true, "Event start date and time are required"]
    },
    endAt: {
      type: Date,
      required: [true, "Event end date and time are required"]
    },
    category: {
      type: String,
      trim: true,
      enum: ["academic", "career", "social", "sports", "workshop", "other"],
      default: "other"
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

eventSchema.index({ startAt: 1 });

module.exports = mongoose.model("Event", eventSchema);
