const express = require("express");
const router = express.Router();
const Node = require("../models/Node");

// Get all nodes
router.get("/", async (req, res) => {
  try {
    const nodes = await Node.find();
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a node
router.post("/", async (req, res) => {
  const { title, description, codeSnippet, postedBy } = req.body;
  const node = new Node({ title, description, codeSnippet, postedBy });
  try {
    const newNode = await node.save();
    res.status(201).json(newNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a node
router.put("/:id", async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (node.postedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    node.title = req.body.title || node.title;
    node.description = req.body.description || node.description;
    node.codeSnippet = req.body.codeSnippet || node.codeSnippet;
    const updatedNode = await node.save();
    res.json(updatedNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a node
router.delete("/:id", async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (node.postedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await node.remove();
    res.json({ message: "Node deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
