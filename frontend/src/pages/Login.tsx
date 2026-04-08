import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { FaEnvelope, FaLock, FaLightbulb, FaUsers, FaStar } from "react-icons/fa";
import logo from "../assets/logo.svg";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token && data.safeuser) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.safeuser));
        navigate("/");
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors[0]?.message || data.message || "Login failed");
        } else {
          setError(data.message || "Login failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex-col justify-center items-start p-12 relative overflow-hidden">

        {/* Animated Background Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400 opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-4 mb-12 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src={logo}
              alt="Coursis"
              className="w-16 h-16 object-contain"
            />
            <span className="text-white text-3xl font-bold tracking-tight">Coursis</span>
          </button>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome Back to Your Learning Journey
          </h1>
          <p className="text-indigo-100 text-lg mb-12 max-w-md">
            Access thousands of courses, connect with experts, and grow your skills.
          </p>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex-shrink-0">
                <FaLightbulb className="text-yellow-300 text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Learn from Experts</h3>
                <p className="text-indigo-100 text-sm">Industry professionals teaching real-world skills</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex-shrink-0">
                <FaUsers className="text-blue-200 text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Join a Community</h3>
                <p className="text-indigo-100 text-sm">Network with thousands of learners worldwide</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex-shrink-0">
                <FaStar className="text-amber-300 text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Get Certified</h3>
                <p className="text-indigo-100 text-sm">Earn recognized certifications and boost your career</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition duration-200"
          >
            Create Account
          </button>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-indigo-600 hover:underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-indigo-600 hover:underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}