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

function App() {
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