import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider(); // Create provider locally
  console.log("Created googleProvider in Login.js:", googleProvider);

  // Handle redirect result (in case redirect was previously initiated)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log("Checking for Google redirect result...");
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Google Login Success (Redirect):", result.user);
          navigate("/");
        } else {
          console.log("No redirect result found.");
        }
      } catch (err) {
        console.error("Google Redirect Error:", err);
        setError(`Google redirect failed: ${err.message}`);
      }
    };
    handleRedirectResult();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Email Login Success");
      navigate("/");
    } catch (err) {
      console.error("Email Login Error:", err);
      setError(`Failed to log in with email: ${err.message}`);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Email Registration Success");
      navigate("/");
    } catch (err) {
      console.error("Email Registration Error:", err);
      setError(`Failed to register with email: ${err.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    if (!googleProvider) {
      setError(
        "Google provider is not initialized. Please check Firebase configuration."
      );
      return;
    }
    try {
      console.log("Attempting Google Sign-In with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Login Success (Popup):", result.user);
      navigate("/");
    } catch (err) {
      console.error("Google Popup Error:", err);
      let errorMessage = "Failed to log in with Google.";
      if (err.code === "auth/popup-blocked") {
        console.log("Popup blocked, falling back to redirect...");
        try {
          await signInWithRedirect(auth, googleProvider);
          // Redirect will be handled by useEffect
          return;
        } catch (redirectErr) {
          console.error("Google Redirect Fallback Error:", redirectErr);
          errorMessage = `Redirect fallback failed: ${redirectErr.message}`;
        }
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Popup request cancelled. Please try again.";
      } else {
        errorMessage = `Google login failed: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="relative z-10 max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Login to SynapShare
      </h1>
      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4 bg-red-100/50 dark:bg-red-900/50 p-3 rounded-lg">
          {error}
        </p>
      )}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 transition-all text-gray-800 dark:text-gray-100"
            required
          />
          <button
            onClick={handleEmailLogin}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition w-full mb-2"
          >
            Login with Email
          </button>
          <button
            onClick={handleEmailRegister}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition w-full"
          >
            Register with Email
          </button>
        </div>
        <div className="flex items-center justify-center mb-4">
          <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
          <span className="px-4 text-gray-600 dark:text-gray-400">or</span>
          <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition w-full"
        >
          <FcGoogle className="text-xl" /> Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
