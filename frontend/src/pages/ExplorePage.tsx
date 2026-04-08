import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import type { CourseCardProps } from "../components/CourseCard";
import { ENDPOINTS } from "../config/api";
import { FaBook, FaArrowLeft } from "react-icons/fa";

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(ENDPOINTS.courses);
        const data = await res.json();

        if (data?.status === "success" && Array.isArray(data.data)) {
          const allCourses: CourseCardProps[] = data.data.map((c: any) => ({
            _id: c._id || Math.random().toString(),
            title: c.title || "Untitled Course",
            description: c.description || "No description available",
            price: c.price ?? 0,
          }));

          setCourses(allCourses);
        } else {
          setError("No courses found.");
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-12 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
              <FaBook className="text-indigo-600 text-sm" />
              <span className="text-sm font-semibold text-indigo-600">Explore All Courses</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Discover Your Next <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Learning Path</span>
            </h1>

            <p className="text-gray-600 text-lg max-w-2xl">
              Browse our comprehensive collection of professional courses taught by industry experts. Find the perfect course to advance your career.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-8 py-16 border-t border-gray-100">

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-lg">Loading courses</p>
                <p className="text-gray-500 text-sm mt-1">Please wait while we fetch the latest courses...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="py-24 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Error Loading Courses</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="transform hover:-translate-y-2 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4"
                >
                  <CourseCard
                    _id={course._id}
                    title={course.title}
                    description={course.description}
                    price={course.price}
                  />
                </div>
              ))}
            </div>

            {/* Back to Home Button */}
            <div className="mt-16 text-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition duration-200"
              >
                <FaArrowLeft className="text-sm" />
                Back to Home
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;