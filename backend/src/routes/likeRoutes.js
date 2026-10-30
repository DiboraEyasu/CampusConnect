
const express = require("express");
const router = express.Router();

const {
    likePost,
    unlikePost,
    getPostLikes
} = require("../controllers/likeController");

const authenticate = require("../middleware/authenticate");

// Read likes for a post
router.get("/:postId/likes", getPostLikes);

// Like a post
router.put("/:postId/like", authenticate, likePost);

// Unlike a post
router.delete("/:postId/like", authenticate, unlikePost);

module.exports = router;
