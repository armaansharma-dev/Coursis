const { Router } = require("express");
const { auth } = require("../middlewares/authenticate");
const { logger } = require("../middlewares/logger");
const { restrictTo } = require("../middlewares/restrictTo");
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

// Admin stats
adminRouter.get("/stats", logger, auth, restrictTo("admin"), getAdminStats);

// User management
adminRouter.get("/users", logger, auth, restrictTo("admin"), getAllUsers);

adminRouter.get("/users/:userId", logger, auth, restrictTo("admin"), getUserDetail);

adminRouter.patch(
  "/users/:userId/role",
  logger,
  auth,
  restrictTo("admin"),
  validator(updateUserRoleValidator),
  updateUserRole
);

adminRouter.delete("/users/:userId", logger, auth, restrictTo("admin"), deleteUser);

adminRouter.get("/users/:userId/enrollments", logger, auth, restrictTo("admin"), getUserEnrollments);

// Course management
adminRouter.get("/courses", logger, auth, restrictTo("admin"), getAllCourses);

adminRouter.get("/courses/:courseId", logger, auth, restrictTo("admin"), getCourseDetail);

adminRouter.patch(
  "/courses/:courseId",
  logger,
  auth,
  restrictTo("admin"),
  validator(updateCourseValidator),
  updateCourse
);

adminRouter.patch(
  "/courses/:courseId/archive",
  logger,
  auth,
  restrictTo("admin"),
  archiveCourse
);

adminRouter.patch(
  "/courses/:courseId/restore",
  logger,
  auth,
  restrictTo("admin"),
  restoreCourse
);

adminRouter.delete("/courses/:courseId", logger, auth, restrictTo("admin"), deleteCourse);

module.exports = adminRouter;
