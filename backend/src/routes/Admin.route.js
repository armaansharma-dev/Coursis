const { Router } = require("express");
const { auth } = require("../middlewares/authenticate");
const { logger } = require("../middlewares/logger");
const { validator } = require("../middlewares/validator");
const {
  getAdminStats,
  getAllUsers,
  getAllCourses,
  getCourseDetail,
  updateCourse,
  archiveCourse,
  restoreCourse,
  deleteCourse,
  getUserDetail,
  updateUserRole,
  deleteUser,
  getUserEnrollments,
} = require("../controllers/admin.controller");
const {
  updateUserRoleValidator,
  updateCourseValidator,
} = require("../validators/admin.schema");

const adminRouter = Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};

// Admin stats
adminRouter.get("/stats", logger, auth, isAdmin, getAdminStats);

// User management
adminRouter.get("/users", logger, auth, isAdmin, getAllUsers);

adminRouter.get("/users/:userId", logger, auth, isAdmin, getUserDetail);

adminRouter.patch(
  "/users/:userId/role",
  logger,
  auth,
  isAdmin,
  validator(updateUserRoleValidator),
  updateUserRole
);

adminRouter.delete("/users/:userId", logger, auth, isAdmin, deleteUser);

adminRouter.get("/users/:userId/enrollments", logger, auth, isAdmin, getUserEnrollments);

// Course management
adminRouter.get("/courses", logger, auth, isAdmin, getAllCourses);

adminRouter.get("/courses/:courseId", logger, auth, isAdmin, getCourseDetail);

adminRouter.patch(
  "/courses/:courseId",
  logger,
  auth,
  isAdmin,
  validator(updateCourseValidator),
  updateCourse
);

adminRouter.patch(
  "/courses/:courseId/archive",
  logger,
  auth,
  isAdmin,
  archiveCourse
);

adminRouter.patch(
  "/courses/:courseId/restore",
  logger,
  auth,
  isAdmin,
  restoreCourse
);

adminRouter.delete("/courses/:courseId", logger, auth, isAdmin, deleteCourse);

module.exports = adminRouter;
