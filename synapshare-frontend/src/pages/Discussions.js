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

function Discussions({ user }) {
  const [discussions, setDiscussions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.get(
          "http://localhost:5000/api/discussions",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setDiscussions(response.data);
      } catch (err) {
        setError("Failed to fetch discussions.");
      }
    };
    fetchDiscussions();
  }, []);

  const fetchComments = async (discussionId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/discussions/${discussionId}/comments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setComments((prev) => ({
        ...prev,
        [discussionId]: response.data.comments,
      }));
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
        "http://localhost:5000/api/discussions",
        {
          title,
          content,
          postedBy: user.email,
          upvotes: 0,
          downvotes: 0,
          voters: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscussions([...discussions, res.data]);
      setSuccess("Discussion posted successfully!");
      setTitle("");
      setContent("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to post discussion.");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!user || !editingDiscussion) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const updatedDiscussion = await axios.put(
        `http://localhost:5000/api/discussions/${editingDiscussion._id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscussions(
        discussions.map((d) =>
          d._id === editingDiscussion._id ? updatedDiscussion.data : d
        )
      );
      setSuccess("Discussion updated successfully!");
      setEditingDiscussion(null);
      setTitle("");
      setContent("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update discussion.");
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      setError("You must be logged in to delete a discussion.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const discussion = discussions.find((d) => d._id === id);
      if (discussion.postedBy !== user.email) {
        setError("You can only delete your own discussions.");
        return;
      }
      await axios.delete(`http://localhost:5000/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscussions(discussions.filter((d) => d._id !== id));
      setSuccess("Discussion deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete discussion.");
    }
  };

  const handleVote = async (id, type) => {
    if (!user) {
      setError("Please log in to vote.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const discussion = discussions.find((d) => d._id === id);
      if (discussion.voters && discussion.voters.includes(user.email)) {
        setError("You have already voted on this discussion.");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/discussions/${id}/${type}`,
        { userId: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscussions(
        discussions.map((d) => (d._id === id ? response.data : d))
      );
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
        { postType: "discussion", postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Discussion saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save discussion.");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/discussions/${id}`;
    navigator.clipboard.writeText(url);
    setSuccess("Link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleComment = async (discussionId) => {
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
        `http://localhost:5000/api/discussions/${discussionId}/comments`,
        { content: newComment, postedBy: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({
        ...prev,
        [discussionId]: [...(prev[discussionId] || []), response.data],
      }));
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const startEditing = (discussion) => {
    setEditingDiscussion(discussion);
    setTitle(discussion.title);
    setContent(discussion.content);
  };

  const toggleComments = (discussionId) => {
    if (!showComments[discussionId]) {
      fetchComments(discussionId);
    }
    setShowComments((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };

  return (
    <div className="relative z-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Discussions Feed
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
            placeholder="Discussion Title"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            rows="4"
            required
          />
          <button
            onClick={editingDiscussion ? handleEdit : handlePost}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition w-full"
          >
            {editingDiscussion ? "Update Discussion" : "Post Discussion"}
          </button>
          {editingDiscussion && (
            <button
              onClick={() => setEditingDiscussion(null)}
              className="mt-4 text-red-600 dark:text-red-400 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Log in to post discussions.
        </p>
      )}
      <div className="space-y-6">
        {discussions.map((discussion) => (
          <div
            key={discussion._id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white font-medium">
                {discussion.postedBy.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {discussion.postedBy.split("@")[0]}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {discussion.postedBy}
                </p>
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">
              {discussion.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {discussion.content}
            </p>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => handleVote(discussion._id, "upvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && discussion.voters?.includes(user.email)}
              >
                <FaArrowUp /> {discussion.upvotes || 0}
              </button>
              <button
                onClick={() => handleVote(discussion._id, "downvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && discussion.voters?.includes(user.email)}
              >
                <FaArrowDown /> {discussion.downvotes || 0}
              </button>
            </div>
            {user && (
              <div className="flex space-x-4">
                {discussion.postedBy === user.email && (
                  <>
                    <button
                      onClick={() => startEditing(discussion)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(discussion._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleSave(discussion._id)}
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                >
                  <FaSave />
                </button>
                <button
                  onClick={() => handleShare(discussion._id)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={() => toggleComments(discussion._id)}
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <FaComment /> {comments[discussion._id]?.length || 0}
                </button>
              </div>
            )}
            {showComments[discussion._id] && (
              <div className="mt-4">
                <div className="space-y-2 mb-4">
                  {comments[discussion._id]?.map((comment) => (
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
                      onClick={() => handleComment(discussion._id)}
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

export default Discussions;
