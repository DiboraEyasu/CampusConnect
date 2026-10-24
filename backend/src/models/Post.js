const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Post content is Required"],
            trim: true,
            minlength: [1, "Post cannot be empty"],
            maxlength: [2000, "Posts cannot exceed 2000 characters"]
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        imageUrl: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);
