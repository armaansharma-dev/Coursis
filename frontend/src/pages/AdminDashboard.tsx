import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { FaUsers, FaBook, FaDollarSign, FaEdit, FaTrash, FaTimes, FaCheck, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaEllipsisV } from "react-icons/fa";

type AdminStats = {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  archivedCourses: number;
  publishedCourses: number;
  totalSales: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  isArchived: boolean;
  published: boolean;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const initialLoadRef = useRef(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses">("overview");
  const [showArchived, setShowArchived] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [viewingUserEnrollments, setViewingUserEnrollments] = useState<User | null>(null);
  const [userEnrollmentsData, setUserEnrollmentsData] = useState<any>(null);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: 0, published: false });
  const [userRoleForm, setUserRoleForm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [courseEnrollments, setCourseEnrollments] = useState<Record<string, number>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialLoadRef.current && token && user?.role === "admin") {
      initialLoadRef.current = true;
      loadAllData();
    } else if (!token || user?.role !== "admin") {
      navigate("/");
    }
  }, [token, user, navigate]);

  // Refresh enrollment data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && courses.length > 0) {
        await refreshCourseEnrollments();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [courses, token]);

  const loadAllData = async () => {
    try {
      setError(null);
      setLoading(true);

      const statsRes = await fetch(ENDPOINTS.adminStats, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();
      setStats(statsData.data);

      const usersRes = await fetch(`${ENDPOINTS.adminUsers}?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsers(usersData.data);

      const coursesRes = await fetch(`${ENDPOINTS.adminCourses}?page=1&limit=100&includeArchived=true`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData.data || []);

      // Fetch enrollment counts for each course
      if (coursesData.data && Array.isArray(coursesData.data)) {
        const enrollmentCounts: Record<string, number> = {};
        for (const course of coursesData.data) {
          try {
            const enrollRes = await fetch(ENDPOINTS.enrolledUsers(course._id), {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            if (enrollRes.ok) {
              const enrollData = await enrollRes.json();
              enrollmentCounts[course._id] = enrollData.count || enrollData.enrollments?.length || 0;
            }
          } catch (err) {
            enrollmentCounts[course._id] = 0;
          }
        }
        setCourseEnrollments(enrollmentCounts);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshCourseEnrollments = async () => {
    if (!token || courses.length === 0) return;

    try {
      const enrollmentCounts: Record<string, number> = {};
      for (const course of courses) {
        try {
          const enrollRes = await fetch(ENDPOINTS.enrolledUsers(course._id), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            enrollmentCounts[course._id] = enrollData.count || enrollData.enrollments?.length || 0;
          } else {
            enrollmentCounts[course._id] = 0;
          }
        } catch (err) {
          enrollmentCounts[course._id] = 0;
        }
      }
      setCourseEnrollments(enrollmentCounts);
    } catch (err) {
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.adminUsers}/${deletingUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete user");
      }

      setDeletingUser(null);
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting user";
      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewUserEnrollments = async (u: User) => {
    setViewingUserEnrollments(u);
    setEnrollmentsLoading(true);

    try {
      const res = await fetch(ENDPOINTS.adminUserEnrollments(u._id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch enrollments");

      const data = await res.json();
      setUserEnrollmentsData(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load enrollments";
      alert(message);
      setViewingUserEnrollments(null);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      published: course.published,
    });
  };

  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    try {
      const res = await fetch(ENDPOINTS.updateAdminCourse(editingCourse._id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update course");
      }
      setEditingCourse(null);
      await loadAllData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving course");
    }
  };

  const handlePublishToggle = async (courseId: string, currentPublished: boolean) => {
    try {
      const res = await fetch(ENDPOINTS.updateAdminCourse(courseId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: !currentPublished }),
      });
      if (!res.ok) throw new Error("Failed to update course");
      await loadAllData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating course");
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const res = await fetch(ENDPOINTS.archiveCourse(courseId), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to archive course");
      await loadAllData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error archiving course");
    }
  };

  const handleRestoreCourse = async (courseId: string) => {
    try {
      const res = await fetch(ENDPOINTS.restoreCourse(courseId), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to restore course");
      await loadAllData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error restoring course");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Delete this course permanently?")) return;
    try {
      const res = await fetch(ENDPOINTS.deleteCourse(courseId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");
      await loadAllData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting course");
    }
  };

  const handleEditUserRole = (u: User) => {
    setEditingUser(u);
    setUserRoleForm(u.role);
  };

  const handleSaveUserRole = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(ENDPOINTS.updateUserRole(editingUser._id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: userRoleForm }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || "Failed to update role");
      }

      setEditingUser(null);
      setUserRoleForm("");
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error updating role";
      alert(message);
    }
  };

  const totalSales = stats?.totalSales || 0;
  const filteredCourses = showArchived ? courses.filter((c) => c.isArchived) : courses.filter((c) => !c.isArchived);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-indigo-50 mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between h-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-1 w-fit">
          {["overview", "users", "courses"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition capitalize text-sm ${
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-600 text-white shadow-md"
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
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h2>
                <p className="text-indigo-100">Manage users, courses, and platform analytics in one place</p>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Users Card */}
              <div
                onClick={() => setActiveTab("users")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-blue-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">View All</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Total Users</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>

              {/* Total Courses Card */}
              <div
                onClick={() => setActiveTab("courses")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaBook className="text-green-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">View All</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Total Courses</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>

              {/* Total Sales Card */}
              <div
                onClick={() => setActiveTab("courses")}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaDollarSign className="text-purple-600 text-lg" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">Calculated</span>
                  </div>
                  <p className="text-gray-600 font-semibold text-sm mb-2">Total Sales</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">₹{totalSales.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-4">From published courses</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-indigo-600 text-sm" />
                  </div>
                  User Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">Manage user roles, permissions, and account deletions</p>
                <button
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Manage Users
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaBook className="text-green-600 text-sm" />
                  </div>
                  Course Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">Edit, publish, archive, or delete courses</p>
                <button
                  onClick={() => setActiveTab("courses")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  Manage Courses
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalTeachers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents}</p>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : u.role === "teacher"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewUserEnrollments(u)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition inline-flex items-center gap-1"
                              title="View enrollments"
                            >
                              <FaBook size={12} /> Enrollments
                            </button>
                            <button
                              onClick={() => handleEditUserRole(u)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition inline-flex items-center gap-1"
                            >
                              <FaTrash size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalCourses}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Published</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.publishedCourses}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Archived</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.archivedCourses}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Creator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Enrollments</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-xs truncate">{course.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.creator?.name || "Unknown"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{course.price}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaUsers className="text-gray-400 text-xs" />
                            <span className="font-semibold text-gray-900">{courseEnrollments[course._id] || 0}</span>
                          </div>
                        </td>
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
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2 border-b border-gray-100"
                                >
                                  <FaEdit className="text-indigo-600" size={12} /> Edit
                                </button>

                                {!course.isArchived && (
                                  <button
                                    onClick={() => {
                                      handlePublishToggle(course._id, course.published);
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
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No {showArchived ? "archived " : ""}courses found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
              <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveCourse}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingCourse(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Change User Role</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-medium mb-1">User</p>
              <p className="text-lg font-bold text-gray-900">{editingUser.name}</p>
              <p className="text-sm text-gray-600">{editingUser.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Role</label>
              <select
                value={userRoleForm}
                onChange={(e) => setUserRoleForm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-sm"
              >
                <option value="user">User (Student)</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveUserRole}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
              >
                Save Role
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6 p-4 bg-red-50 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-2xl flex-shrink-0" />
              <h2 className="text-xl font-bold text-red-900">Delete User?</h2>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">{deletingUser.name}</span> (<span className="text-gray-600">{deletingUser.email}</span>)
              </p>
              <p className="text-sm text-gray-600">This action cannot be undone. The user account, all enrollments, and associated data will be permanently deleted.</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? "Deleting..." : <>
                  <FaTrash size={14} /> Delete
                </>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Enrollments Modal */}
      {viewingUserEnrollments && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">User Enrollments</h2>
              <button onClick={() => { setViewingUserEnrollments(null); setUserEnrollmentsData(null); }} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition">
                <FaTimes className="text-lg" />
              </button>
            </div>

            {enrollmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-indigo-600"></div>
              </div>
            ) : userEnrollmentsData ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">User</p>
                  <p className="text-lg font-bold text-gray-900">{userEnrollmentsData.user.name}</p>
                  <p className="text-sm text-gray-600">{userEnrollmentsData.user.email}</p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Enrollments</p>
                      <p className="font-bold text-gray-900">{userEnrollmentsData.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Spent</p>
                      <p className="font-bold text-gray-900">₹{userEnrollmentsData.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Enrollments Table */}
                {userEnrollmentsData.enrollments && userEnrollmentsData.enrollments.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Enrolled</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userEnrollmentsData.enrollments.map((e: any) => (
                          <tr key={e._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{e.course?.title || "Deleted Course"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">₹{e.priceBought || 0}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                e.status === "active" ? "bg-green-100 text-green-700"
                                : e.status === "completed" ? "bg-blue-100 text-blue-700"
                                : e.status === "refunded" ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                              }`}>
                                {e.status?.charAt(0).toUpperCase() + e.status?.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${e.progress || 0}%` }}></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{e.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(e.purchasedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No enrollments found</p>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => { setViewingUserEnrollments(null); setUserEnrollmentsData(null); }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
