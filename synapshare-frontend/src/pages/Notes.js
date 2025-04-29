import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaShareAlt,
  FaArrowUp,
  FaArrowDown,
  FaComment,
} from "react-icons/fa";

function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.get("http://localhost:5000/api/notes", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNotes(response.data);
      } catch (err) {
        setError("Failed to fetch notes.");
      }
    };
    fetchNotes();
  }, []);

  const fetchComments = async (noteId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/notes/${noteId}/comments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setComments((prev) => ({ ...prev, [noteId]: response.data.comments }));
    } catch (err) {
      setError("Failed to fetch comments.");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to post.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(
        "http://localhost:5000/api/notes",
        {
          title,
          subject,
          uploadedBy: user.email,
          upvotes: 0,
          downvotes: 0,
          voters: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, res.data]);
      setSuccess("Note posted successfully!");
      setTitle("");
      setSubject("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to post note.");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!user || !editingNote) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const updatedNote = await axios.put(
        `http://localhost:5000/api/notes/${editingNote._id}`,
        { title, subject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(
        notes.map((n) => (n._id === editingNote._id ? updatedNote.data : n))
      );
      setSuccess("Note updated successfully!");
      setEditingNote(null);
      setTitle("");
      setSubject("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update note.");
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      setError("You must be logged in to delete a note.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const note = notes.find((n) => n._id === id);
      if (note.uploadedBy !== user.email) {
        setError("You can only delete your own notes.");
        return;
      }
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n._id !== id));
      setSuccess("Note deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete note.");
    }
  };

  const handleVote = async (id, type) => {
    if (!user) {
      setError("Please log in to vote.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const note = notes.find((n) => n._id === id);
      if (note.voters && note.voters.includes(user.email)) {
        setError("You have already voted on this note.");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/notes/${id}/${type}`,
        { userId: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((n) => (n._id === id ? response.data : n)));
    } catch (err) {
      setError("Failed to vote.");
    }
  };

  const handleSave = async (id) => {
    if (!user) {
      setError("Please log in to save.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        "http://localhost:5000/api/savedPosts",
        { postType: "note", postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Note saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save note.");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/notes/${id}`;
    navigator.clipboard.writeText(url);
    setSuccess("Link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleComment = async (noteId) => {
    if (!user) {
      setError("Please log in to comment.");
      return;
    }
    if (!newComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `http://localhost:5000/api/notes/${noteId}/comments`,
        { content: newComment, postedBy: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({
        ...prev,
        [noteId]: [...(prev[noteId] || []), response.data],
      }));
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject);
  };

  const toggleComments = (noteId) => {
    if (!showComments[noteId]) {
      fetchComments(noteId);
    }
    setShowComments((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  };

  return (
    <div className="relative z-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Notes Feed
      </h1>
      {user ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <p className="text-red-500 dark:text-red-400 mb-4 bg-red-100/50 dark:bg-red-900/50 p-3 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 dark:text-green-400 mb-4 bg-green-100/50 dark:bg-green-900/50 p-3 rounded-lg">
              {success}
            </p>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <button
            onClick={editingNote ? handleEdit : handlePost}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition w-full"
          >
            {editingNote ? "Update Note" : "Post Note"}
          </button>
          {editingNote && (
            <button
              onClick={() => setEditingNote(null)}
              className="mt-4 text-red-600 dark:text-red-400 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Log in to post notes.
        </p>
      )}
      <div className="space-y-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white font-medium">
                {note.uploadedBy.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {note.uploadedBy.split("@")[0]}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {note.uploadedBy}
                </p>
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">
              {note.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subject: {note.subject}
            </p>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => handleVote(note._id, "upvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && note.voters?.includes(user.email)}
              >
                <FaArrowUp /> {note.upvotes || 0}
              </button>
              <button
                onClick={() => handleVote(note._id, "downvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && note.voters?.includes(user.email)}
              >
                <FaArrowDown /> {note.downvotes || 0}
              </button>
            </div>
            {user && (
              <div className="flex space-x-4">
                {note.uploadedBy === user.email && (
                  <>
                    <button
                      onClick={() => startEditing(note)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleSave(note._id)}
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                >
                  <FaSave />
                </button>
                <button
                  onClick={() => handleShare(note._id)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={() => toggleComments(note._id)}
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <FaComment /> {comments[note._id]?.length || 0}
                </button>
              </div>
            )}
            {showComments[note._id] && (
              <div className="mt-4">
                <div className="space-y-2 mb-4">
                  {comments[note._id]?.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Posted by: {comment.postedBy} on{" "}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                    <button
                      onClick={() => handleComment(note._id)}
                      className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;
