
const express = require("express");

const authenticate = require("../middleware/authenticate");

const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

const router = express.Router();

// Comments belonging to a post
router.get("/posts/:postId/comments", getComments);
router.post(
  "/posts/:postId/comments",
  authenticate,
  createComment
);

// Manage an individual comment
router.patch("/comments/:id", authenticate, updateComment);
router.delete("/comments/:id", authenticate, deleteComment);

module.exports = router;
