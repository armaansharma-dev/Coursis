const { asyncWrapper } = require("../middlewares/catchAsync");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { AppError } = require("../utils/AppError");

// Get admin stats
exports.getAdminStats = asyncWrapper(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalTeachers = await User.countDocuments({ role: "teacher" });
  const totalStudents = await User.countDocuments({ role: "user" });
  const totalCourses = await Course.countDocuments();
  const archivedCourses = await Course.countDocuments({ isArchived: true });
  const publishedCourses = await Course.countDocuments({ published: true, isArchived: false });

  // Calculate total sales from enrollments
  const enrollmentStats = await Enrollment.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$priceBought" },
      },
    },
  ]);

  const totalSales = enrollmentStats.length > 0 ? enrollmentStats[0].totalSales : 0;

  res.status(200).json({
    status: "success",
    data: {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      archivedCourses,
      publishedCourses,
      totalSales,
    },
  });
});

// Get all users with pagination
exports.getAllUsers = asyncWrapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select("-password")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
});

// Update user role
exports.updateUserRole = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["admin", "teacher", "user"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  // Prevent changing your own role
  const adminId = req.user.id.toString();
  const targetId = userId.toString();

  if (adminId === targetId) {
    return next(new AppError("You cannot change your own role", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.status(200).json({
    status: "success",
    message: "User role updated successfully",
    data: userWithoutPassword,
  });
});

// Get all courses with pagination
exports.getAllCourses = asyncWrapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const includeArchived = req.query.includeArchived === "true";

  const query = includeArchived ? {} : { isArchived: false };

  const courses = await Course.find(query)
    .populate("creator", "name email")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Course.countDocuments(query);

  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: courses,
  });
});

// Get single course
exports.getCourseDetail = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId)
    .populate("creator", "name email");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: course,
  });
});

// Update course 
exports.updateCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, price, image, published } = req.body;

  const allowedFields = ["title", "description", "price", "image", "published"];
  const updates = {};

  for (let field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  updates.lastModifyBy = req.user.id;
  updates.lastModifyAt = new Date();

  const course = await Course.findByIdAndUpdate(
    courseId,
    updates,
    { new: true, runValidators: true }
  ).populate("creator", "name email");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Course updated successfully",
    data: course,
  });
});

// Archive course (soft delete)
exports.archiveCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByIdAndUpdate(
    courseId,
    { isArchived: true, lastModifyBy: req.user.id, lastModifyAt: new Date() },
    { new: true }
  ).populate("creator", "name email");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Course archived successfully",
    data: course,
  });
});

// Restore archived course
exports.restoreCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByIdAndUpdate(
    courseId,
    { isArchived: false, lastModifyBy: req.user.id, lastModifyAt: new Date() },
    { new: true }
  ).populate("creator", "name email");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Course restored successfully",
    data: course,
  });
});

// Delete course permanently
exports.deleteCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByIdAndDelete(courseId);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Course deleted permanently",
  });
});

// Get user details
exports.getUserDetail = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Delete user permanently with all enrollments
exports.deleteUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  // Find user first
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Delete all enrollments where this user is enrolled
  await Enrollment.deleteMany({ user: userId });

  // Delete the user
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    message: "User and all associated enrollments deleted permanently",
  });
});

// Get user's enrollments with course details
exports.getUserEnrollments = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: "course",
      select: "title description price creator isArchived published"
    })
    .populate({
      path: "course.creator",
      select: "name email"
    })
    .sort({ purchasedAt: -1 });

  res.status(200).json({
    status: "success",
    data: {
      user: user.toObject(),
      enrollments,
      total: enrollments.length,
      totalSpent: enrollments.reduce((sum, e) => sum + (e.priceBought || 0), 0)
    }
  });
});
