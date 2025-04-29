import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { auth } from "./firebase";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Discussions from "./pages/Discussions";
import Nodes from "./pages/Nodes";
import News from "./pages/News";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import {
  FaBook,
  FaComments,
  FaProjectDiagram,
  FaNewspaper,
  FaSearch,
  FaSignOutAlt,
  FaSignInAlt,
  FaMoon,
  FaSun,
  FaUserShield,
} from "react-icons/fa";

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      console.log("Auth State Changed - User:", user); // Debug log
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = {
    background: {
      color: { value: darkMode ? "#000000" : "#FFFFFF" },
    },
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: darkMode ? "#FFFFFF" : "#000000" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      links: {
        enable: true,
        distance: 150,
        color: darkMode ? "#FFFFFF" : "#000000",
        opacity: 0.4,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        outModes: "out",
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 200, links: { opacity: 1 } },
        push: { quantity: 4 },
      },
    },
  };

  const isAdmin = user && user.email === "porwalkamlesh5@gmail.com";

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative bg-white dark:bg-black">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
        <nav className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 shadow-md z-20 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold text-black dark:text-white"
            >
              SynapShare
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/notes"
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaBook className="text-lg" /> Notes
              </Link>
              <Link
                to="/discussions"
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaComments className="text-lg" /> Discussions
              </Link>
              <Link
                to="/nodes"
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaProjectDiagram className="text-lg" /> Nodes
              </Link>
              <Link
                to="/news"
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaNewspaper className="text-lg" /> News
              </Link>
              <Link
                to="/search"
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaSearch className="text-lg" /> Search
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <FaUserShield className="text-lg" /> Admin
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <FaSignInAlt className="text-lg" /> Login
                </Link>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {darkMode ? (
                  <FaSun className="text-lg" />
                ) : (
                  <FaMoon className="text-lg" />
                )}
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </nav>

        <main className="container flex-grow relative z-10 pt-12">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/notes" element={<Notes user={user} />} />
            <Route path="/discussions" element={<Discussions user={user} />} />
            <Route path="/nodes" element={<Nodes user={user} />} />
            <Route path="/news" element={<News />} />
            <Route path="/search" element={<Search user={user} />} />{" "}
            {/* Added user prop */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
