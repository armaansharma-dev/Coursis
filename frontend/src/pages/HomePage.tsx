import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CourseCard from "../components/CourseCard"
import type { CourseCardProps } from "../components/CourseCard"
import { ENDPOINTS } from "../config/api"
import { FaBook, FaUsers, FaStar, FaCertificate, FaArrowRight, FaPlay } from "react-icons/fa"

const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const name = user?.name || "Learner"

  useEffect(() => {
    const fetchRandomCourses = async () => {
      try {
        const res = await fetch(ENDPOINTS.randomCourses)
        const data = await res.json()

        if (data?.status === "success") {
          setCourses(data.data.slice(0, 6))
        }
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }

    fetchRandomCourses()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
              <FaStar className="text-indigo-600 text-sm" />
              <span className="text-sm font-semibold text-indigo-600">Welcome back 👋</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Hi {name}, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ready to Learn?</span>
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Discover curated courses from industry experts. Master new skills, advance your career, and join thousands of learners.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Courses <FaArrowRight className="text-sm" />
              </button>

              <button
                onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
                className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
              >
                <FaPlay className="text-sm" /> Browse Courses
              </button>
            </div>
          </div>

          {/* Right - Visual Section */}
          <div className="relative h-96 md:h-full min-h-96 flex items-center justify-center">
            {/* Animated gradient circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse"></div>
            </div>

            {/* Icons Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-6 w-full max-w-xs">
              <div className="group">
                <div className="h-24 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center group-hover:-translate-y-2 transition-transform">
                  <FaBook className="text-indigo-600 text-4xl" />
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mt-3">Learn</p>
              </div>

              <div className="group">
                <div className="h-24 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center group-hover:-translate-y-2 transition-transform">
                  <FaUsers className="text-purple-600 text-4xl" />
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mt-3">Connect</p>
              </div>

              <div className="group">
                <div className="h-24 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center group-hover:-translate-y-2 transition-transform">
                  <FaCertificate className="text-indigo-600 text-4xl" />
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mt-3">Certify</p>
              </div>

              <div className="group">
                <div className="h-24 bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center group-hover:-translate-y-2 transition-transform">
                  <FaStar className="text-purple-600 text-4xl" />
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mt-3">Excel</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FaBook className="text-indigo-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expert Instructors</h3>
            <p className="text-gray-600 text-sm">Learn from industry professionals with years of experience</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FaCertificate className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Recognized Certificates</h3>
            <p className="text-gray-600 text-sm">Get verified certificates upon course completion</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FaUsers className="text-indigo-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Support</h3>
            <p className="text-gray-600 text-sm">Connect with peers and get help from mentors anytime</p>
          </div>
        </div>
      </section>

      {/* Recommended Courses Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-4">
            <FaStar className="text-indigo-600 text-sm" />
            <span className="text-sm font-semibold text-indigo-600">Featured Courses</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recommended For You
          </h2>

          <p className="text-gray-600 text-lg">
            Handpicked courses to accelerate your learning journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading amazing courses...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="transform hover:-translate-y-2 transition-transform duration-300">
                <CourseCard
                  _id={course._id}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                />
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-lg hover:shadow-xl"
          >
            View All Courses <FaArrowRight className="text-sm" />
          </button>
        </div>

      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Skills?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join our growing community of learners and start your journey today
          </p>
          <button
            onClick={scrollToTop}
            className="px-10 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
          >
            Start Learning Today
          </button>
        </div>
      </section>

    </div>
  )
}

export default HomePage