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

function Nodes({ user }) {
  const [nodes, setNodes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingNode, setEditingNode] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.get("http://localhost:5000/api/nodes", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNodes(response.data);
      } catch (err) {
        setError("Failed to fetch nodes.");
      }
    };
    fetchNodes();
  }, []);

  const fetchComments = async (nodeId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/nodes/${nodeId}/comments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setComments((prev) => ({ ...prev, [nodeId]: response.data.comments }));
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
        "http://localhost:5000/api/nodes",
        {
          title,
          description,
          postedBy: user.email,
          upvotes: 0,
          downvotes: 0,
          voters: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNodes([...nodes, res.data]);
      setSuccess("Node posted successfully!");
      setTitle("");
      setDescription("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to post node.");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!user || !editingNode) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const updatedNode = await axios.put(
        `http://localhost:5000/api/nodes/${editingNode._id}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNodes(
        nodes.map((n) => (n._id === editingNode._id ? updatedNode.data : n))
      );
      setSuccess("Node updated successfully!");
      setEditingNode(null);
      setTitle("");
      setDescription("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update node.");
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      setError("You must be logged in to delete a node.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const node = nodes.find((n) => n._id === id);
      if (node.postedBy !== user.email) {
        setError("You can only delete your own nodes.");
        return;
      }
      await axios.delete(`http://localhost:5000/api/nodes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNodes(nodes.filter((n) => n._id !== id));
      setSuccess("Node deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete node.");
    }
  };

  const handleVote = async (id, type) => {
    if (!user) {
      setError("Please log in to vote.");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const node = nodes.find((n) => n._id === id);
      if (node.voters && node.voters.includes(user.email)) {
        setError("You have already voted on this node.");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/nodes/${id}/${type}`,
        { userId: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNodes(nodes.map((n) => (n._id === id ? response.data : n)));
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
        { postType: "node", postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Node saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save node.");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/nodes/${id}`;
    navigator.clipboard.writeText(url);
    setSuccess("Link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleComment = async (nodeId) => {
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
        `http://localhost:5000/api/nodes/${nodeId}/comments`,
        { content: newComment, postedBy: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({
        ...prev,
        [nodeId]: [...(prev[nodeId] || []), response.data],
      }));
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const startEditing = (node) => {
    setEditingNode(node);
    setTitle(node.title);
    setDescription(node.description);
  };

  const toggleComments = (nodeId) => {
    if (!showComments[nodeId]) {
      fetchComments(nodeId);
    }
    setShowComments((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  return (
    <div className="relative z-10">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-8">
        Nodes
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
            placeholder="Node Title"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            rows="4"
            required
          />
          <button
            onClick={editingNode ? handleEdit : handlePost}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition w-full"
          >
            {editingNode ? "Update Node" : "Post Node"}
          </button>
          {editingNode && (
            <button
              onClick={() => setEditingNode(null)}
              className="mt-4 text-red-600 dark:text-red-400 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Log in to post nodes.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <div
            key={node._id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
              {node.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {node.description}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Posted by: {node.postedBy}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => handleVote(node._id, "upvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && node.voters?.includes(user.email)}
              >
                <FaArrowUp /> {node.upvotes || 0}
              </button>
              <button
                onClick={() => handleVote(node._id, "downvote")}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                disabled={user && node.voters?.includes(user.email)}
              >
                <FaArrowDown /> {node.downvotes || 0}
              </button>
            </div>
            {user && (
              <div className="flex space-x-4 mt-4">
                {node.postedBy === user.email && (
                  <>
                    <button
                      onClick={() => startEditing(node)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(node._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleSave(node._id)}
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                >
                  <FaSave />
                </button>
                <button
                  onClick={() => handleShare(node._id)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={() => toggleComments(node._id)}
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <FaComment /> {comments[node._id]?.length || 0}
                </button>
              </div>
            )}
            {showComments[node._id] && (
              <div className="mt-4">
                <div className="space-y-2 mb-4">
                  {comments[node._id]?.map((comment) => (
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
                      onClick={() => handleComment(node._id)}
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

export default Nodes;
