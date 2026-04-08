import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { FaBook, FaClock, FaGraduationCap, FaCheckCircle } from "react-icons/fa";

type EnrolledCourse = {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    createdAt: string;
  };
  status: string;
  priceBought: number;
  progress: number;
};

interface ApiResponse {
  success: boolean;
  message?: string;
  data: EnrolledCourse[];
  count?: number;
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchMyCourses();
  }, [token, navigate]);

  const fetchMyCourses = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(ENDPOINTS.myEnrollments, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle user deleted/not found
      if (res.status === 401 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data: ApiResponse = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setEnrollments(data.data);
      } else {
        setEnrollments([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch your courses. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FaBook className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900">My Courses</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your enrolled courses and continue learning
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchMyCourses}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard Stats */}
        {enrollments.length > 0 && (
          <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Courses</p>
                  <p className="text-4xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
                <div className="p-4 bg-indigo-100 rounded-full">
                  <FaBook className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {enrollments.filter((e) => e.progress > 0 && e.progress < 100).length}
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <FaClock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                  <p className="text-4xl font-bold text-green-600">
                    {enrollments.filter((e) => e.progress === 100).length}
                  </p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <FaCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid or Empty State */}
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-200">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <FaBook className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No courses yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses. Start exploring and enroll in
              courses to get started!
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 flex flex-col"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                  <FaGraduationCap className="w-16 h-16 text-indigo-300" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {enrollment.course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-indigo-600">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() =>
                      navigate(`/course/${enrollment.course._id}`)
                    }
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition mt-auto"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;