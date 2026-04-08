import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaCompass, FaHome, FaChevronDown, FaSignOutAlt, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import logo from "../../assets/logo.svg"

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-98 shadow-sm">
      <div className="px-6 md:px-8 py-3 flex items-center justify-between gap-8">

        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-gray-900 hover:opacity-80 transition duration-200 group flex-shrink-0"
        >
          <img
            src={logo}
            alt="Coursis"
            className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <span className="tracking-tight text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:inline">
            Coursis
          </span>
        </Link>

        {/* Center: Navigation Links */}
        {token && (
          <div className="hidden lg:flex items-center gap-2">
            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium bg-transparent hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 group"
            >
              <FaHome className="text-sm group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </button>

            {/* Explore Button */}
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium bg-transparent hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 group"
            >
              <FaCompass className="text-sm group-hover:scale-110 transition-transform" />
              <span>Explore</span>
            </button>
          </div>
        )}

        {/* Right: Auth/Profile */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

          {!token ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-indigo-500 font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Profile Dropdown */}
              <div ref={dropdownRef} className="relative">

              {/* Profile Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-all duration-200 group border border-indigo-200"
              >
                <FaUserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm hidden sm:inline">{user?.name?.split(" ")[0]}</span>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* User Info Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-transparent">
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-indigo-100 rounded-full">
                      <span className="text-xs font-semibold text-indigo-600 capitalize">{user?.role}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">

                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="block px-6 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🛡️ Admin Dashboard
                      </Link>
                    )}

                    {user?.role === "teacher" && (
                      <Link
                        to="/teacher"
                        className="block px-6 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 text-sm font-medium"
                        onClick={() => setDropdownOpen(false)}
                      >
                        👨‍🏫 Teacher Dashboard
                      </Link>
                    )}

                    {user?.role === "user" && (
                      <Link
                        to="/my-courses"
                        className="block px-6 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📚 My Courses
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="block px-6 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-sm font-medium"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ⚙️ My Profile
                    </Link>

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-200"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}