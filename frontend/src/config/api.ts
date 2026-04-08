// Base URL for backend API
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5400/api/v1";

// Endpoints for all pages
export const ENDPOINTS = {
  // Courses
  courses: `${API_BASE_URL}/course`,           // GET all courses, POST new course
  randomCourses: `${API_BASE_URL}/course/random`, // GET random courses (for homepage scroll)
  courseById: (id: string) => `${API_BASE_URL}/course/${id}`, // GET/PUT/DELETE single course
  teacherMyCourses: `${API_BASE_URL}/course/my/courses`, // GET teacher's own courses (all including unpublished)

  // Authentication
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,

  // Enrollment
  enrollCourse: (courseId: string) => `${API_BASE_URL}/enrollment/${courseId}`,
  myEnrollments: `${API_BASE_URL}/enrollment/me`,
  cancelEnrollment: (enrollmentId: string) => `${API_BASE_URL}/enrollment/${enrollmentId}`,
  enrolledUsers: (courseId: string) => `${API_BASE_URL}/course/${courseId}/enrollments`,

  // User Profile
  myProfile: `${API_BASE_URL}/user/me`,
  updateProfile: `${API_BASE_URL}/user/me`,
  changePassword: `${API_BASE_URL}/user/me/password`,
  changeEmail: `${API_BASE_URL}/user/me/email`,

  // Admin
  adminStats: `${API_BASE_URL}/admin/stats`,
  adminUsers: `${API_BASE_URL}/admin/users`,
  adminUserDetail: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
  adminUserEnrollments: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/enrollments`,
  updateUserRole: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/role`,
  adminCourses: `${API_BASE_URL}/admin/courses`,
  adminCourseDetail: (courseId: string) => `${API_BASE_URL}/admin/courses/${courseId}`,
  updateAdminCourse: (courseId: string) => `${API_BASE_URL}/admin/courses/${courseId}`,
  archiveCourse: (courseId: string) => `${API_BASE_URL}/admin/courses/${courseId}/archive`,
  restoreCourse: (courseId: string) => `${API_BASE_URL}/admin/courses/${courseId}/restore`,
  deleteCourse: (courseId: string) => `${API_BASE_URL}/admin/courses/${courseId}`,
};