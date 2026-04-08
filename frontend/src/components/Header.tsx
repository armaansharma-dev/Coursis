import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../assets/logo.svg"

function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-98 shadow-sm">
      <div className="px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer select-none font-bold text-gray-900 hover:opacity-80 transition duration-200 group"
        >
          <div className="relative">
            <img
              src={logo}
              alt="Coursis"
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="tracking-tight text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Coursis
          </span>
        </Link>

        {/* Right Side - Auth Links */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2.5 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-xl transition-all duration-200 border border-transparent hover:border-indigo-200"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-6 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-indigo-500 font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  )
}

export default Header