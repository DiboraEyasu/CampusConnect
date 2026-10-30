
const mongoose = require("mongoose");
const Like = require("../models/Like");
const Post = require("../models/Post");

// Like a post
const likePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid post ID"
            });
        }

        const postExists = await Post.exists({ _id: postId });

        if (!postExists) {
            return res.status(404).json({
                status: "error",
                message: "Post not found"
            });
        }

        // $setOnInsert prevents changing an existing like.
        const like = await Like.findOneAndUpdate(
            { user: userId, post: postId },
            {
                $setOnInsert: {
                    user: userId,
                    post: postId
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Post liked",
            like
        });
    } catch (error) {
        next(error);
    }
};

// Unlike a post
const unlikePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid post ID"
            });
        }

        const postExists = await Post.exists({ _id: postId });

        if (!postExists) {
            return res.status(404).json({
                status: "error",
                message: "Post not found"
            });
        }

        await Like.findOneAndDelete({
            user: userId,
            post: postId
        });

        return res.status(200).json({
            status: "success",
            message: "Post unliked"
        });
    } catch (error) {
        next(error);
    }
};

// Get like information for a post
const getPostLikes = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid post ID"
            });
        }

        const postExists = await Post.exists({ _id: postId });

        if (!postExists) {
            return res.status(404).json({
                status: "error",
                message: "Post not found"
            });
        }

        const [likeCount, likes] = await Promise.all([
            Like.countDocuments({ post: postId }),
            Like.find({ post: postId })
                .select("user createdAt")
                .populate("user", "name avatarUrl")
                .sort({ createdAt: -1 })
        ]);

        return res.status(200).json({
            status: "success",
            likeCount,
            likes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    likePost,
    unlikePost,
    getPostLikes
};
