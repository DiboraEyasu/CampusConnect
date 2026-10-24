const express = require("express");
const authenticate = require("../middleware/authenticate");

const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/postController");

const router = express.Router();

// Public read routes
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected write routes
router.post("/", authenticate, createPost);
router.patch("/:id", authenticate, updatePost);
router.delete("/:id", authenticate, deletePost);

module.exports = router;