const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Get all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a note
router.post("/", async (req, res) => {
  const { title, subject, fileUrl, uploadedBy } = req.body;
  const note = new Note({ title, subject, fileUrl, uploadedBy });
  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a note
router.put("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note.uploadedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    note.title = req.body.title || note.title;
    note.subject = req.body.subject || note.subject;
    note.fileUrl = req.body.fileUrl || note.fileUrl;
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note.uploadedBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await note.remove();
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
