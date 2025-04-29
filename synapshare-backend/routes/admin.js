const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Discussion = require("../models/Discussion");
const Node = require("../models/Node");
const { auth } = require("../firebase");

// Delete any note
router.delete("/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete any discussion
router.delete("/discussions/:id", async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: "Discussion deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete any node
router.delete("/nodes/:id", async (req, res) => {
  try {
    await Node.findByIdAndDelete(req.params.id);
    res.json({ message: "Node deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user
router.delete("/users/:email", async (req, res) => {
  try {
    await auth.deleteUser(req.params.email);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
