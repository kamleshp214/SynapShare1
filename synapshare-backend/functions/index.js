const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify Firebase token
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Fetch all discussions
app.get("/api/discussions", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("discussions")
      .orderBy("createdAt", "desc")
      .get();
    const discussions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const commentsSnapshot = await doc.ref.collection("comments").get();
        const comments = commentsSnapshot.docs.map((commentDoc) => ({
          _id: commentDoc.id,
          ...commentDoc.data(),
        }));
        return {
          _id: doc.id,
          ...doc.data(),
          comments,
        };
      })
    );
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch discussions" });
  }
});

// Add a comment to a discussion
app.post("/api/discussions/:id/comments", authenticate, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.user;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const discussionRef = db.collection("discussions").doc(id);
    const doc = await discussionRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const comment = {
      userId: user.uid,
      email: user.email,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const commentRef = await discussionRef.collection("comments").add(comment);
    res.json({ _id: commentRef.id, ...comment });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Upvote or downvote a discussion
app.post("/api/discussions/:id/vote", authenticate, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // "upvote" or "downvote"
  const user = req.user;

  if (!["upvote", "downvote"].includes(type)) {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  try {
    const discussionRef = db.collection("discussions").doc(id);
    const voteRef = db.collection("votes").doc(`${id}_${user.uid}`);
    const discussionDoc = await discussionRef.get();
    const voteDoc = await voteRef.get();

    if (!discussionDoc.exists) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const discussionData = discussionDoc.data();
    let updates = {};

    if (voteDoc.exists) {
      const previousVote = voteDoc.data().type;
      if (previousVote === type) {
        // User is removing their vote
        await voteRef.delete();
        if (type === "upvote") {
          updates.upvotes = (discussionData.upvotes || 0) - 1;
        } else {
          updates.downvotes = (discussionData.downvotes || 0) - 1;
        }
      } else {
        // User is changing their vote
        await voteRef.set({ discussionId: id, userId: user.uid, type });
        if (type === "upvote") {
          updates.upvotes = (discussionData.upvotes || 0) + 1;
          updates.downvotes = (discussionData.downvotes || 0) - 1;
        } else {
          updates.downvotes = (discussionData.downvotes || 0) + 1;
          updates.upvotes = (discussionData.upvotes || 0) - 1;
        }
      }
    } else {
      // New vote
      await voteRef.set({ discussionId: id, userId: user.uid, type });
      if (type === "upvote") {
        updates.upvotes = (discussionData.upvotes || 0) + 1;
      } else {
        updates.downvotes = (discussionData.downvotes || 0) + 1;
      }
    }

    await discussionRef.update(updates);
    const updatedDoc = await discussionRef.get();
    res.json({ _id: id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: "Failed to vote" });
  }
});

exports.api = functions.https.onRequest(app);
