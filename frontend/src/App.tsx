import "./App.css"

import CourseDetails from "./pages/CourseDetails"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import HomePage from "./pages/HomePage"
import ExplorePage from "./pages/ExplorePage"
import MyCourses from "./pages/MyCourses"
import EditProfile from "./pages/EditProfile"
import AdminDashboard from "./pages/AdminDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"

import Layout from "./components/layout/Layout"
import AuthLayout from "./components/layout/AuthLayout"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { ENDPOINTS } from "./config/api"

// JWTs are base64url ("-" and "_" instead of "+" and "/"),
// which plain atob() cannot decode. Convert before decoding.
function decodeJwtPayload(token: string) {
  const base64Url = token.split(".")[1]
  if (!base64Url) throw new Error("Invalid token")
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  return JSON.parse(atob(base64))
}

function App() {
  // Bumping this forces a re-render, so Navbar re-reads the
  // refreshed token/user from localStorage.
  const [, setAuthVersion] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    let decoded: { exp?: number }
    try {
      decoded = decodeJwtPayload(token)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return
    }

    if (typeof decoded.exp === "number" && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return
    }

    // The token is a 7-hour snapshot of the role. Ask the server for
    // a fresh one so admin role changes apply without re-login.
    const syncSession = async () => {
      try {
        const res = await fetch(ENDPOINTS.refresh, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.status === 401 || res.status === 404) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setAuthVersion((v) => v + 1)
          return
        }

        if (!res.ok) return

        const data = await res.json()
        if (data?.token && data?.safeuser) {
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.safeuser))
          setAuthVersion((v) => v + 1)
        }
      } catch {
        // Offline: keep the stored session; individual pages show errors.
      }
    }

    syncSession()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage/>} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Route>

          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
      </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App