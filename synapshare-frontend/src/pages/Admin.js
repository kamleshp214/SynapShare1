import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";

function Admin({ user }) {
  const [notes, setNotes] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch data for notes, discussions, nodes, and users
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.email !== "porwalkamlesh5@gmail.com") return;

      setLoading(true);
      setError(""); // Clear previous errors
      setSuccess(""); // Clear previous success messages

      try {
        const token = await auth.currentUser.getIdToken();
        const [notesRes, discussionsRes, nodesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/notes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/discussions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/nodes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setNotes(notesRes.data || []);
        setDiscussions(discussionsRes.data || []);
        setNodes(nodesRes.data || []);

        // Fetch users (mocked for now; ideally, fetch from backend)
        setUsers([
          { email: "porwalkamlesh5@gmail.com" },
          { email: "test@example.com" },
        ]);
      } catch (err) {
        console.error("Fetch Data Error:", err);
        setError(
          "Failed to fetch data: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle deleting a post (notes, discussions, nodes)
  const handleDeletePost = async (type, id) => {
    setError("");
    setSuccess("");
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/admin/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state based on type
      if (type === "notes") {
        setNotes(notes.filter((note) => note._id !== id));
      } else if (type === "discussions") {
        setDiscussions(discussions.filter((d) => d._id !== id));
      } else if (type === "nodes") {
        setNodes(nodes.filter((node) => node._id !== id));
      }

      setSuccess(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } post deleted successfully!`
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(`Delete ${type} Error:`, err);
      setError(
        `Failed to delete ${type} post: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (email) => {
    setError("");
    setSuccess("");
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/users/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((u) => u.email !== email));
      setSuccess("User deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete User Error:", err);
      setError(
        `Failed to delete user: ${err.response?.data?.message || err.message}`
      );
    }
  };

  // Admin access check
  if (!user || user.email !== "porwalkamlesh5@gmail.com") {
    return (
      <div className="relative z-10 max-w-4xl mx-auto mt-16">
        <p className="text-red-500 dark:text-red-400 text-center py-16 bg-white/80 dark:bg-black/80 backdrop-blur-md">
          Admin access required.
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-4xl mx-auto mt-16">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Admin Dashboard
      </h1>
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
      {loading && (
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
          Loading data...
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
              No notes available.
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
              <button
                onClick={() => handleDeletePost("notes", note._id)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition mt-4"
              >
                Delete
              </button>
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
              No discussions available.
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
              <button
                onClick={() => handleDeletePost("discussions", discussion._id)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition mt-4"
              >
                Delete
              </button>
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
              No nodes available.
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
              <button
                onClick={() => handleDeletePost("nodes", node._id)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition mt-4"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Users Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Users
          </h2>
          {users.length === 0 && !loading && (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No users available.
            </p>
          )}
          {users.map((u) => (
            <div
              key={u.email}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-4"
            >
              <p className="text-gray-800 dark:text-gray-100">
                Email: {u.email}
              </p>
              <button
                onClick={() => handleDeleteUser(u.email)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition mt-4"
                disabled={u.email === "porwalkamlesh5@gmail.com"} // Prevent deleting the admin
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
