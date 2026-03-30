import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../components/firebase";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const showError = (msg, duration = 4000) => {
    setError(msg);
    setTimeout(() => setError(""), duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/kanban-board");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          showError("This email is already registered. Try logging in instead.");
          break;
        case "auth/invalid-email":
          showError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          showError("Password must be at least 6 characters.");
          break;
        case "auth/user-not-found":
          showError("No account found with this email.");
          break;
        case "auth/wrong-password":
          showError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          showError("Invalid email or password. Please try again.");
          break;
        default:
          showError("Something went wrong. Please try again.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/kanban-board");
    } catch (error) {
      // Show error immediately based on error code
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        showError("Sign-in cancelled. Please try again.", 3000);
      } else if (error.code === "auth/popup-blocked") {
        showError("Popup was blocked by your browser. Please allow popups and try again.", 5000);
      } else if (error.code === "auth/network-request-failed") {
        showError("Network error. Check your connection and try again.", 5000);
      } else {
        showError("Google sign-in failed. Please try again.", 4000);
      }
      // ✅ Stop loading immediately so the error shows right away
      setIsGoogleLoading(false);
      return;
    }

    setIsGoogleLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="absolute w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-70 top-20 left-20 animate-pulse"></div>
      <div className="absolute w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-70 bottom-20 right-20 animate-pulse"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-lg shadow-2xl border border-white/30">

        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/70 text-white text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isGoogleLoading}
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isGoogleLoading}
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isEmailLoading || isGoogleLoading}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEmailLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="px-2 text-white text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isEmailLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {/* ✅ Hide toggle text when Google is loading */}
        {!isGoogleLoading && (
          <p className="text-center text-white mt-4 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              className="underline cursor-pointer font-semibold"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
            >
              {isLogin ? "Sign Up" : "Login Here"}
            </span>
          </p>
        )}

      </div>
    </div>
  );
}