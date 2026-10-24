
const mongoose = require("mongoose");
const User = require("../models/User");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

// GET /api/users/me
async function getMyProfile(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    return res.status(200).json({
      status: "success",
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve profile."
    });
  }
}

// PATCH /api/users/me
async function updateMyProfile(req, res) {
  try {
    const { name, bio, avatarUrl } = req.body || {};

    // Reject empty update requests
    const allowedFields = ["name", "bio", "avatarUrl"];

    const submittedFields = Object.keys(req.body || {});

    if (
      submittedFields.length === 0 ||
      submittedFields.some(
        field => !allowedFields.includes(field)
      )
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Provide valid profile fields: name, bio, avatarUrl."
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          status: "error",
          message: "Name must be 2 to 100 characters."
        });
      }

      updates.name = name.trim();
    }

    if (bio !== undefined) {
      if (
        typeof bio !== "string" ||
        bio.length > 300
      ) {
        return res.status(400).json({
          status: "error",
          message: "Bio must be 300 characters or fewer."
        });
      }

      updates.bio = bio.trim();
    }

    if (avatarUrl !== undefined) {
      if (
        typeof avatarUrl !== "string" ||
        avatarUrl.length > 2048
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid avatar URL."
        });
      }

      const cleanedUrl = avatarUrl.trim();

      if (cleanedUrl) {
        try {
          const parsedUrl = new URL(cleanedUrl);

          if (
            parsedUrl.protocol !== "https:" &&
            parsedUrl.protocol !== "http:"
          ) {
            throw new Error("Unsupported URL protocol");
          }
        } catch {
          return res.status(400).json({
            status: "error",
            message: "Avatar must be a valid HTTP or HTTPS URL."
          });
        }
      }

      updates.avatarUrl = cleanedUrl;
    }

    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authenticated user."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to update profile."
    });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile
};

