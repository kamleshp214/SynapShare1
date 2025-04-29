const express = require("express");
const router = express.Router();
const Discussion = require("../models/Discussion");

// Get all discussions
router.get("/", async (req, res) => {
  try {
    const discussions = await Discussion.find();
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a discussion
router.post("/", async (req, res) => {
  const { title, content, postedBy } = req.body;
  const discussion = new Discussion({ title, content, postedBy, upvotes: 0 });
  try {
    const newDiscussion = await discussion.save();
    res.status(201).json(newDiscussion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a discussion
router.put("/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (discussion.postedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    discussion.title = req.body.title || discussion.title;
    discussion.content = req.body.content || discussion.content;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a discussion
router.delete("/:id", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (discussion.postedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await discussion.remove();
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upvote a discussion
router.post("/:id/upvote", async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    discussion.upvotes += 1;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
