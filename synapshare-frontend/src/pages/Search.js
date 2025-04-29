import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";

function Search({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Log user state for debugging
  useEffect(() => {
    console.log("User State:", user);
    if (user) {
      console.log("User Email:", user.email);
    } else {
      console.log("User is null or undefined.");
    }
  }, [user]);

  // Reset results when search term changes
  useEffect(() => {
    setNotes([]);
    setDiscussions([]);
    setNodes([]);
    setError("");
  }, [searchTerm]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
    if (!user || !user.email) {
      setError("You must be logged in to search. User data unavailable.");
      console.log("User check failed:", user);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = await auth.currentUser.getIdToken();
      console.log("Fetching search results with token:", token.substring(0, 10) + "..."); // Log first 10 chars of token
      const [notesRes, discussionsRes, nodesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/search/notes?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/search/discussions?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/search/nodes?query=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Search Results - Notes:", notesRes.data);
      console.log("Search Results - Discussions:", discussionsRes.data);
      console.log("Search Results - Nodes:", nodesRes.data);

      setNotes(notesRes.data || []);
      setDiscussions(discussionsRes.data || []);
      setNodes(nodesRes.data || []);
    } catch (err) {
      console.error("Search Error:", err);
      setError(`Failed to search: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto mt-16">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Search SynapShare
      </h1>
      <form onSubmit={handleSearch} className="mb-8 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes, discussions, or nodes..."
          className="w-full max-w-md p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-r-lg hover:bg-indigo-500 transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4 bg-red-100/50 dark:bg-red-900/50 p-3 rounded-lg text-center">
          {error}
        </p>
      )}

      <div className="grid gap-8">
        {/* Notes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Notes
          </h2>
          {notes.length === 0 && !loading && (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No notes found.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-4"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {note.title || "Untitled"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Subject: {note.subject || "N/A"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Uploaded by: {note.uploadedBy || "Unknown"}
              </p>
            </div>
          ))}
        </div>

        {/* Discussions Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Discussions
          </h2>
          {discussions.length === 0 && !loading && (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No discussions found.
            </p>
          )}
          {discussions.map((discussion) => (
            <div
              key={discussion._id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-4"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {discussion.title || "Untitled"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {discussion.content || "No content available."}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Posted by: {discussion.postedBy || "Unknown"}
              </p>
            </div>
          ))}
        </div>

        {/* Nodes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Nodes
          </h2>
          {nodes.length === 0 && !loading && (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No nodes found.
            </p>
          )}
          {nodes.map((node) => (
            <div
              key={node._id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-4"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {node.title || "Untitled"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {node.description || "No description available."}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Posted by: {node.postedBy || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;