import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Home({ user }) {
  return (
    <div className="relative z-10">
      {user && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center text-white text-2xl font-medium">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
              {user.email.split("@")[0]}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Welcome to SynapShare
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect, share, and learn with the community.
        </p>
      </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to="/notes"
          className="block bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            Notes
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Share and view study notes.
          </p>
        </Link>
        <Link
          to="/discussions"
          className="block bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            Discussions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Engage in community discussions.
          </p>
        </Link>
        <Link
          to="/nodes"
          className="block bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            Nodes
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore connected ideas.
          </p>
        </Link>
        <Link
          to="/news"
          className="block bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            News
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest news.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
