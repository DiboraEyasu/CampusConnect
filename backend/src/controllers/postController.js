const mongoose = require("mongoose");
const Post = require("../models/Post");

function validImageUrl(value) {
  if (value === "") return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// GET /api/posts?page=1&limit=10
async function getPosts(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        status: "error",
        message: "Page must be positive and limit must be between 1 and 50."
      });
    }

    const [posts, total] = await Promise.all([
      Post.find()
        .populate("author", "name avatarUrl")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Post.countDocuments()
    ]);

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      posts
    });
  } catch (error) {
    console.error("Get posts error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve posts."
    });
  }
}

// GET /api/posts/:id
async function getPostById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID."
      });
    }

    const post = await Post.findById(req.params.id)
      .populate("author", "name avatarUrl");

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found."
      });
    }

    return res.status(200).json({
      status: "success",
      post
    });
  } catch (error) {
    console.error("Get post error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve post."
    });
  }
}

// POST /api/posts
async function createPost(req, res) {
  try {
    const { content, imageUrl } = req.body || {};

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Post content is required."
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        status: "error",
        message: "Post cannot exceed 2000 characters."
      });
    }

    if (
      imageUrl !== undefined &&
      (typeof imageUrl !== "string" ||
        imageUrl.length > 2048 ||
        !validImageUrl(imageUrl.trim()))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Image URL must be a valid HTTP or HTTPS URL."
      });
    }

    const post = await Post.create({
      content: content.trim(),
      imageUrl: imageUrl === undefined ? "" : imageUrl.trim(),
      author: req.userId
    });

    await post.populate("author", "name avatarUrl");

    return res.status(201).json({
      status: "success",
      message: "Post created successfully.",
      post
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to create post."
    });
  }
}

// PATCH /api/posts/:id
async function updatePost(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID."
      });
    }

    const { content, imageUrl } = req.body || {};
    const fields = Object.keys(req.body || {});

    if (
      fields.length === 0 ||
      fields.some(field => !["content", "imageUrl"].includes(field))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Provide content and/or imageUrl only."
      });
    }

    const updates = {};

    if (content !== undefined) {
      if (
        typeof content !== "string" ||
        !content.trim() ||
        content.trim().length > 2000
      ) {
        return res.status(400).json({
          status: "error",
          message: "Content must contain 1 to 2000 characters."
        });
      }

      updates.content = content.trim();
    }

    if (imageUrl !== undefined) {
      if (
        typeof imageUrl !== "string" ||
        imageUrl.length > 2048 ||
        !validImageUrl(imageUrl.trim())
      ) {
        return res.status(400).json({
          status: "error",
          message: "Image URL must be a valid HTTP or HTTPS URL."
        });
      }

      updates.imageUrl = imageUrl.trim();
    }

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.userId
      },
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).populate("author", "name avatarUrl");

    if (!post) {
      const existingPost = await Post.exists({
        _id: req.params.id
      });

      return res.status(existingPost ? 403 : 404).json({
        status: "error",
        message: existingPost
          ? "You can only edit your own posts."
          : "Post not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Post updated successfully.",
      post
    });
  } catch (error) {
    console.error("Update post error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to update post."
    });
  }
}

// DELETE /api/posts/:id
async function deletePost(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID."
      });
    }

    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!post) {
      const existingPost = await Post.exists({
        _id: req.params.id
      });

      return res.status(existingPost ? 403 : 404).json({
        status: "error",
        message: existingPost
          ? "You can only delete your own posts."
          : "Post not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Post deleted successfully."
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to delete post."
    });
  }
}

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};