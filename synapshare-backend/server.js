const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const firebaseAdmin = require("firebase-admin");
const multer = require("multer");
const axios = require("axios");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

// MongoDB Connection
mongoose;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Multer for file uploads (Study Materials)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Schemas
const noteSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  uploadedBy: String,
  subject: String,
  createdAt: { type: Date, default: Date.now },
  text: { type: String, index: "text" },
});
const discussionSchema = new mongoose.Schema({
  title: String,
  content: String,
  postedBy: String,
  upvotes: { type: Number, default: 0 },
  comments: [
    {
      content: String,
      postedBy: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  text: { type: String, index: "text" },
});
const nodeSchema = new mongoose.Schema({
  title: String,
  description: String,
  codeSnippet: String,
  postedBy: String,
  createdAt: { type: Date, default: Date.now },
  text: { type: String, index: "text" },
});
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

const Note = mongoose.model("Note", noteSchema);
const Discussion = mongoose.model("Discussion", discussionSchema);
const Node = mongoose.model("Node", nodeSchema);
const SavedPost = mongoose.model("SavedPost", savedPostSchema);

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.email === "porwalkamlesh5@gmail.com") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};

// Routes
// Study Materials
app.post("/api/notes", verifyToken, upload.single("file"), async (req, res) => {
  const { title, subject } = req.body;
  // In a real app, upload file to cloud storage (e.g., Firebase Storage)
  const fileUrl = "https://example.com/placeholder.pdf"; // Placeholder
  const note = new Note({
    title,
    fileUrl,
    subject,
    uploadedBy: req.user.email,
    text: title,
  });
  await note.save();
  res.status(201).json(note);
});

app.get("/api/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// Edit a note
app.put(
  "/api/notes/:id",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).json({ error: "Note not found" });
      if (note.uploadedBy !== req.user.email) {
        return res.status(403).json({ error: "Not authorized" });
      }
      note.title = req.body.title || note.title;
      note.subject = req.body.subject || note.subject;
      note.text = req.body.title || note.text;
      if (req.file) {
        note.fileUrl = "https://example.com/placeholder.pdf"; // Replace with actual file upload logic
      }
      await note.save();
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a note
app.delete("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.uploadedBy !== req.user.email) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Discussion Forum
app.post("/api/discussions", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  const discussion = new Discussion({
    title,
    content,
    postedBy: req.user.email,
    text: `${title} ${content}`,
  });
  await discussion.save();
  res.status(201).json(discussion);
});

app.get("/api/discussions", async (req, res) => {
  const discussions = await Discussion.find();
  res.json(discussions);
});

app.post("/api/discussions/:id/upvote", verifyToken, async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  discussion.upvotes += 1;
  await discussion.save();
  res.json(discussion);
});

// Edit a discussion
app.put("/api/discussions/:id", verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion)
      return res.status(404).json({ error: "Discussion not found" });
    if (discussion.postedBy !== req.user.email) {
      return res.status(403).json({ error: "Not authorized" });
    }
    discussion.title = req.body.title || discussion.title;
    discussion.content = req.body.content || discussion.content;
    discussion.text = `${req.body.title || discussion.title} ${
      req.body.content || discussion.content
    }`;
    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a discussion
app.delete("/api/discussions/:id", verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion)
      return res.status(404).json({ error: "Discussion not found" });
    if (discussion.postedBy !== req.user.email) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await discussion.deleteOne();
    res.json({ message: "Discussion deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Node (Projects/Ideas)
app.post("/api/nodes", verifyToken, async (req, res) => {
  const { title, description, codeSnippet } = req.body;
  const node = new Node({
    title,
    description,
    codeSnippet,
    postedBy: req.user.email,
    text: `${title} ${description}`,
  });
  await node.save();
  res.status(201).json(node);
});

app.get("/api/nodes", async (req, res) => {
  const nodes = await Node.find();
  res.json(nodes);
});

// Edit a node
app.put("/api/nodes/:id", verifyToken, async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: "Node not found" });
    if (node.postedBy !== req.user.email) {
      return res.status(403).json({ error: "Not authorized" });
    }
    node.title = req.body.title || node.title;
    node.description = req.body.description || node.description;
    node.codeSnippet = req.body.codeSnippet || node.codeSnippet;
    node.text = `${req.body.title || node.title} ${
      req.body.description || node.description
    }`;
    await node.save();
    res.json(node);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a node
app.delete("/api/nodes/:id", verifyToken, async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: "Node not found" });
    if (node.postedBy !== req.user.email) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await node.deleteOne();
    res.json({ message: "Node deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
app.delete("/api/users/:email", verifyToken, isAdmin, async (req, res) => {
  try {
    await firebaseAdmin.auth().deleteUser(req.params.email);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete any note
app.delete("/api/admin/notes/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete any discussion
app.delete(
  "/api/admin/discussions/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const discussion = await Discussion.findById(req.params.id);
      if (!discussion)
        return res.status(404).json({ error: "Discussion not found" });
      await discussion.deleteOne();
      res.json({ message: "Discussion deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: Delete any node
app.delete("/api/admin/nodes/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ error: "Node not found" });
    await node.deleteOne();
    res.json({ message: "Node deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save a post
app.post("/api/savedPosts", verifyToken, async (req, res) => {
  try {
    const { postType, postId } = req.body;
    const savedPost = new SavedPost({
      userEmail: req.user.email,
      postType,
      postId,
    });
    await savedPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get saved posts
app.get("/api/savedPosts", verifyToken, async (req, res) => {
  try {
    const savedPosts = await SavedPost.find({ userEmail: req.user.email });
    res.json(savedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tech News
app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        category: "technology",
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    res.json(response.data.articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Search
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  const notes = await Note.find({ $text: { $search: q } });
  const discussions = await Discussion.find({ $text: { $search: q } });
  const nodes = await Node.find({ $text: { $search: q } });
  res.json({ notes, discussions, nodes });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
