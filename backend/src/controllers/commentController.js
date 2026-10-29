
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Reusable check for MongoDB IDs
function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// Create a comment
async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body || {};

    // 1. Validate post ID
    if (!isValidId(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID."
      });
    }

    // 2. Validate content
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment content is required."
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot exceed 1000 characters."
      });
    }

    // 3. Check that the post exists
    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({
        status: "error",
        message: "Post not found."
      });
    }

    // 4. Create the comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.userId,
      post: postId
    });

    // 5. Return comment with author information
    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name avatarUrl");

    return res.status(201).json({
      status: "success",
      message: "Comment created successfully.",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Create comment error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to create comment."
    });
  }
}

// Get comments belonging to a post
async function getComments(req, res) {
  try {
    const { postId } = req.params;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (!isValidId(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID."
      });
    }

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination values."
      });
    }

    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({
        status: "error",
        message: "Post not found."
      });
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .populate("author", "name avatarUrl")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),

      Comment.countDocuments({ post: postId })
    ]);

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve comments."
    });
  }
}

// Update your own comment
async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid comment ID."
      });
    }

    // Only content is editable
    const allowedFields = ["content"];
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0 ||
      Object.keys(body).some(key => !allowedFields.includes(key))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Provide only the content field."
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Comment content is required."
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot exceed 1000 characters."
      });
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: id, author: req.userId },
      { $set: { content: content.trim() } },
      { returnDocument: "after", runValidators: true }
    ).populate("author", "name avatarUrl");

    if (!comment) {
      const exists = await Comment.exists({ _id: id });

      if (exists) {
        return res.status(403).json({
          status: "error",
          message: "You can only update your own comments."
        });
      }

      return res.status(404).json({
        status: "error",
        message: "Comment not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Comment updated successfully.",
      comment
    });
  } catch (error) {
    console.error("Update comment error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to update comment."
    });
  }
}

// Delete your own comment
async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid comment ID."
      });
    }

    const comment = await Comment.findOneAndDelete({
      _id: id,
      author: req.userId
    });

    if (!comment) {
      const exists = await Comment.exists({ _id: id });

      if (exists) {
        return res.status(403).json({
          status: "error",
          message: "You can only delete your own comments."
        });
      }

      return res.status(404).json({
        status: "error",
        message: "Comment not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Comment deleted successfully."
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete comment."
    });
  }
}

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};
