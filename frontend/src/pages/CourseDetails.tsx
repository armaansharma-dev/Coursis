import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ENDPOINTS } from "../config/api"
import {
  FaArrowLeft,
  FaArrowRight,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCheck,
  FaShieldAlt,
  FaAward,
  FaInfinity,
} from "react-icons/fa"

type Course = {
  _id: string
  title: string
  description: string
  price: number
  image?: string
  creator?: { name: string; email: string }
  createdAt?: string
  updatedAt?: string
  lastModifyAt?: string
  published?: boolean
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    if (!id) {
      setError("Course not found")
      setLoading(false)
      return
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(ENDPOINTS.courseById(id))
        const data = await res.json()

        if (!res.ok || data?.status !== "success" || !data?.data) {
          throw new Error(data?.message || "Failed to fetch the course")
        }

        setCourse(data.data)
        setImageBroken(false)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Failed to fetch the course")
        }
      } finally {
        setLoading(false)
      }
    }

    const checkEnrollmentStatus = async () => {
      if (!token) return

      try {
        const res = await fetch(ENDPOINTS.myEnrollments, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (data.success && Array.isArray(data.data)) {
          const isEnrolled = data.data.some((enrollment: any) => enrollment.course?._id === id)
          setIsAlreadyEnrolled(isEnrolled)
        }
      } catch (err) {
      }
    }

    fetchCourse()
    checkEnrollmentStatus()
  }, [id, token])

  const courseImage = course?.image?.trim() ? course.image.trim() : ""
  const publishedDate = course?.createdAt || course?.updatedAt || course?.lastModifyAt
  const updatedDate = course?.lastModifyAt || course?.updatedAt

  const formatPrice = (price: number) => currencyFormatter.format(price || 0)

  const getEnrollButtonLabel = () => {
    if (enrollLoading) return "Enrolling..."
    if (isAlreadyEnrolled) return "View in My Courses"
    return token ? "Enroll Now" : "Sign in to Enroll"
  }

  const handleEnroll = async () => {
    if (isAlreadyEnrolled) {
      navigate("/my-courses")
      return
    }

    if (!token) {
      navigate("/login")
      return
    }

    try {
      setEnrollError(null)
      setEnrollLoading(true)

      const res = await fetch(ENDPOINTS.enrollCourse(id!), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      const data = await res.json()


      if (!res.ok) {
        // Handle user deleted/not found
        if (res.status === 401 || res.status === 404 || data.message?.includes("not found")) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/login")
          return
        }
        if (res.status === 400 && data.message?.includes("already enrolled")) {
          setIsAlreadyEnrolled(true)
          setEnrollError(data.message)
        } else {
          setEnrollError(data.message || data.errors?.[0]?.message || "Failed to enroll in course")
        }
      } else if (data.success) {
        setEnrollSuccess(true)
        setTimeout(() => {
          navigate("/my-courses")
        }, 2000)
      } else {
        setEnrollError("Enrollment response invalid")
      }
    } catch (err) {
      if (err instanceof Error) {
        setEnrollError(err.message)
      } else {
        setEnrollError("Error enrolling in course. Please try again.")
      }
    } finally {
      setEnrollLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-2xl">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Course</h3>
          <p className="text-gray-600 mb-6">{error || "Course not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            <FaArrowLeft className="text-sm" /> Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-2 py-4 text-gray-600 hover:text-indigo-600 font-medium transition duration-200"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
        </div>
      </div>

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10">
          {/* Hero Title and Subtitle */}
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg">
              Start your learning journey with professionally crafted content
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column (2 cols) - Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Course Image */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200 h-[400px]">
              {courseImage && !imageBroken ? (
                <img
                  src={courseImage}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  onError={() => setImageBroken(true)}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-8 left-8 h-24 w-24 rounded-full bg-white/40 blur-2xl"></div>
                    <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full bg-white/30 blur-2xl"></div>
                  </div>
                  <div className="relative text-center text-white">
                    <FaBook className="text-5xl mb-3 mx-auto opacity-60" />
                    <p className="text-xs text-white/80">Course image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaBook className="text-indigo-600 text-lg" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">About this course</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {course.description}
              </p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Instructor Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-indigo-600 text-lg" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">Instructor</h3>
                </div>
                <p className="text-base font-semibold text-gray-900">{course.creator?.name || "N/A"}</p>
                {course.creator?.email && (
                  <p className="text-xs text-gray-500 mt-2 truncate">{course.creator.email}</p>
                )}
              </div>

              {/* Timeline Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-indigo-600 text-lg" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="font-semibold text-gray-900">{formatDate(publishedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Updated</span>
                    <span className="font-semibold text-gray-900">{formatDate(updatedDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col) - Sticky Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">Price</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  {formatPrice(course.price)}
                </p>

                {course.published !== undefined && (
                  <div className="mb-6 space-y-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      <FaCheckCircle className="text-xs" />
                      {course.published ? "Published" : "Unpublished"}
                    </span>

                    {/* Verification Badges */}
                    <div className="space-y-2 pt-2">
                      {/* Verified Course */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <FaCheck className="text-emerald-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Course Verified</span>
                      </div>

                      {/* Verified Tutor */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <FaShieldAlt className="text-blue-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Verified Tutor</span>
                      </div>

                      {/* Certificate Available */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <FaAward className="text-amber-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Certificate Available</span>
                      </div>

                      {/* Lifetime Access */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <FaInfinity className="text-purple-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Lifetime Access</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className={`w-full px-6 py-4 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  enrollLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : isAlreadyEnrolled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl"
                    : token
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                    : "bg-gray-900 text-white hover:bg-black hover:shadow-xl"
                }`}
              >
                {getEnrollButtonLabel()}
                {!enrollLoading && <FaArrowRight className="text-sm" />}
              </button>

              {/* Messages */}
              {enrollSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-semibold text-sm">Successfully enrolled! 🎉</p>
                </div>
              )}

              {enrollError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium text-xs">{enrollError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Enroll now and begin your journey to mastering new skills with our expert-led course
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg hover:shadow-xl"
          >
            Explore More Courses <FaArrowRight className="text-sm" />
          </button>
        </div>
      </section>

      {/* Success Toast */}
      {enrollSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
          <div className="rounded-lg bg-gray-900 text-white px-5 py-4 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <FaCheckCircle className="text-emerald-400 flex-shrink-0 text-lg" />
            <p className="text-sm font-medium">Enrollment saved. Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  )
}
