import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { FaBook, FaDollarSign, FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash, FaUsers, FaArrowLeft, FaTimes, FaEllipsisV } from "react-icons/fa";

type TeacherCourse = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  isArchived: boolean;
  published: boolean;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

type TeacherStats = {
  totalCourses: number;
  publishedCourses: number;
  archivedCourses: number;
};

type CourseEnrollment = {
  _id: string;
  title: string;
  enrollmentCount: number;
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const initialLoadRef = useRef(false);

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "courses">("overview");
  const [showArchived, setShowArchived] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<Map<string, { count: number; userList: any[] }>>(new Map());

  const [editingCourse, setEditingCourse] = useState<TeacherCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: 0,
    image: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {

    if (!initialLoadRef.current && token && user?.role === "teacher") {
      initialLoadRef.current = true;
      loadTeacherData();
    } else if (!token || user?.role !== "teacher") {
      navigate("/");
    }
  }, [token, user, navigate]);

  // Refresh enrollment data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && courses.length > 0) {
        await refreshEnrollmentData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [courses, token]);

  const loadTeacherData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch teacher's own courses (includes unpublished)
      const coursesRes = await fetch(ENDPOINTS.teacherMyCourses, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData.data || []);

      // Fetch enrollment data for each course
      const enrollmentMap = new Map();
      for (const course of coursesData.data || []) {
        try {
          const enrollRes = await fetch(ENDPOINTS.enrolledUsers(course._id), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            enrollmentMap.set(course._id, {
              count: enrollData.count || 0,
              userList: enrollData.enrollments || [],
            });
          } else {
            enrollmentMap.set(course._id, { count: 0, userList: [] });
          }
        } catch (e) {
          enrollmentMap.set(course._id, { count: 0, userList: [] });
        }
      }
      setEnrollmentData(enrollmentMap);

      // Calculate stats
      const stats: TeacherStats = {
        totalCourses: (coursesData.data || []).length,
        publishedCourses: (coursesData.data || []).filter((c: TeacherCourse) => c.published && !c.isArchived).length,
        archivedCourses: (coursesData.data || []).filter((c: TeacherCourse) => c.isArchived).length,
      };
      setStats(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshEnrollmentData = async () => {
    if (!token || courses.length === 0) return;

    try {
      const enrollmentMap = new Map();
      for (const course of courses) {
        try {
          const enrollRes = await fetch(ENDPOINTS.enrolledUsers(course._id), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            enrollmentMap.set(course._id, {
              count: enrollData.count || 0,
              userList: enrollData.enrollments || [],
            });
          } else {
            enrollmentMap.set(course._id, { count: 0, userList: [] });
          }
        } catch (e) {
          enrollmentMap.set(course._id, { count: 0, userList: [] });
        }
      }
      setEnrollmentData(enrollmentMap);
    } catch (err) {
    }
  };

  const handleCreateCourse = () => {
    setIsCreating(true);
    setEditingCourse(null);
    setCourseForm({ title: "", description: "", price: 0, image: "" });
  };

  const handleEditCourse = (course: TeacherCourse) => {
    setIsCreating(false);
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
    });
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.description) {
      setError("Please fill title and description");
      return;
    }

    if (courseForm.price < 0) {
      setError("Price cannot be negative");
      return;
    }

    try {
      setError(null);
      const url = isCreating
        ? ENDPOINTS.courses
        : ENDPOINTS.courseById(editingCourse!._id);
      const method = isCreating ? "POST" : "PATCH";

      const payload: any = {
        title: courseForm.title,
        description: courseForm.description,
        price: courseForm.price,
      };

      if (courseForm.image && courseForm.image.trim()) {
        payload.image = courseForm.image;
      }


      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.errors?.[0]?.message || data.message || `Failed to ${isCreating ? "create" : "update"} course`;
        throw new Error(errorMsg);
      }

      setSuccess(`Course ${isCreating ? "created" : "updated"} successfully!`);
      setEditingCourse(null);
      setCourseForm({ title: "", description: "", price: 0, image: "" });
      setIsCreating(false);
      await loadTeacherData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error saving course";
      setError(errorMsg);
    }
  };

  const handlePublishToggle = async (courseId: string) => {
    try {
      const res = await fetch(`${ENDPOINTS.courseById(courseId)}/publish`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to update course");
      await loadTeacherData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating course");
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const res = await fetch(ENDPOINTS.courseById(courseId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isArchived: true }),
      });
      if (!res.ok) throw new Error("Failed to archive course");
      await loadTeacherData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error archiving course");
    }
  };

  const handleRestoreCourse = async (courseId: string) => {
    try {
      const res = await fetch(ENDPOINTS.courseById(courseId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isArchived: false }),
      });
      if (!res.ok) throw new Error("Failed to restore course");
      await loadTeacherData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error restoring course");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course permanently?")) return;
    try {
      const res = await fetch(ENDPOINTS.courseById(courseId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");
      await loadTeacherData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting course");
    }
  };

  const handleTabChange = (tab: "overview" | "courses" | "enrollments") => {
    setActiveTab(tab);
  };

  const totalRevenue = courses
    .filter((c) => c.published && !c.isArchived)
    .reduce((sum, course) => sum + (course.price || 0), 0);

  const filteredCourses = showArchived ? courses.filter((c) => c.isArchived) : courses.filter((c) => !c.isArchived);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between h-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <p className="text-green-700 font-medium">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-700">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-1 w-fit">
          {["overview", "courses"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition capitalize text-sm ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-purple-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Welcome to Teacher Dashboard</h2>
                <p className="text-purple-100">Manage your courses and track student enrollments</p>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Courses Card */}
              <div
                onClick={() => handleTabChange("courses")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaBook className="text-blue-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">All</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Total Courses</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>

              {/* Published Courses Card */}
              <div
                onClick={() => handleTabChange("courses")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaEye className="text-green-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Live</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Published</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.publishedCourses}</p>
                </div>
              </div>

              {/* Total Sales Card */}
              <div
                onClick={() => handleTabChange("courses")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaDollarSign className="text-purple-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">Earnings</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Total Sales</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-4">From published courses</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={handleCreateCourse}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition inline-flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaPlus /> Create Course
              </button>
              <span className="text-sm text-gray-600">{filteredCourses.length} courses</span>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Show Archived Only</span>
              </label>
              <span className="text-sm text-gray-600">{filteredCourses.length} courses</span>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Students</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCourses.map((course) => {
                      const enrollmentCount = enrollmentData.get(course._id)?.count || 0;
                      const revenue = enrollmentCount * (course.price || 0);
                      return (
                        <tr key={course._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-xs truncate">{course.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{course.price}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-gray-400 text-xs" />
                              <span className="font-semibold text-gray-900">{enrollmentCount}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold">₹{revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block ${
                                course.isArchived
                                  ? "bg-gray-100 text-gray-700"
                                  : course.published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {course.isArchived ? "Archived" : course.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm relative">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === course._id ? null : course._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="More actions"
                              >
                                <FaEllipsisV className="text-gray-600" />
                              </button>

                              {/* Dropdown Menu */}
                              {openMenuId === course._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 top-full -mr-2">
                                  <button
                                    onClick={() => {
                                      handleEditCourse(course);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 border-b border-gray-100"
                                  >
                                    <FaEdit className="text-purple-600" size={12} /> Edit
                                  </button>

                                  {!course.isArchived && (
                                    <button
                                      onClick={() => {
                                        handlePublishToggle(course._id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
                                    >
                                      {course.published ? "📴 Unpublish" : "📡 Publish"}
                                    </button>
                                  )}

                                  {course.isArchived ? (
                                    <button
                                      onClick={() => {
                                        handleRestoreCourse(course._id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100"
                                    >
                                      ♻️ Restore
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleArchiveCourse(course._id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2 border-b border-gray-100"
                                    >
                                      📦 Archive
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      handleDeleteCourse(course._id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <FaTrash size={12} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>{showArchived ? "No archived courses" : "No courses yet. Create one to get started!"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Course Modal */}
      {(editingCourse || isCreating) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{isCreating ? "Create Course" : "Edit Course"}</h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setIsCreating(false);
                  setCourseForm({ title: "", description: "", price: 0, image: "" });
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Enter course title (3-30 characters)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter course description (minimum 10 characters)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter course price"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                <input
                  type="url"
                  value={courseForm.image}
                  onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
                  placeholder="Enter image URL or leave blank (https://...)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Courses without an image will show an empty placeholder</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveCourse}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
              >
                {isCreating ? "Create Course" : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setIsCreating(false);
                  setCourseForm({ title: "", description: "", price: 0, image: "" });
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
