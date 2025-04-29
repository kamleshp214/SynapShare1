const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  postType: {
    type: String,
    enum: ["note", "discussion", "node"],
    required: true,
  },
  postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SavedPost", savedPostSchema);
