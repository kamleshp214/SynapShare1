const express = require("express");
const router = express.Router();
const SavedPost = require("../models/SavedPost");

// Save a post
router.post("/", async (req, res) => {
  const { postType, postId } = req.body;
  try {
    const savedPost = new SavedPost({
      userEmail: req.user.email,
      postType,
      postId,
    });
    const newSavedPost = await savedPost.save();
    res.status(201).json(newSavedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get saved posts
router.get("/", async (req, res) => {
  try {
    const savedPosts = await SavedPost.find({ userEmail: req.user.email });
    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
