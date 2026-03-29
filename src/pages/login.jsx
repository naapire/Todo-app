import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false); // false = Sign Up, true = Login
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully");
      } else {
        // Register new user
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered successfully");
      }
      navigate("/kanban-board");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Try logging in instead.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password. Please try again.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
        
        {/* Title swaps based on mode */}
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/70 text-white text-sm text-center">
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
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Button swaps based on mode */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="px-2 text-white text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40">
            Google
          </button>
          <button className="flex-1 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40">
            Facebook
          </button>
        </div>

        {/* Toggle between login and signup */}
        <p className="text-center text-white mt-4 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            className="underline cursor-pointer font-semibold"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
          >
            {isLogin ? "Sign Up" : "Login Here"}
          </span>
        </p>
      </div>
    </div>
  );
}