const {Router} = require("express")
const {logger} = require("../middlewares/logger")
const { validator } = require("../middlewares/validator");
const {auth} = require("../middlewares/authenticate")
const {restrictTo} = require("../middlewares/restrictTo")
const {idValidator} = require("../validators/paramSchema")

const {
    enrollmentValidator,
    enrolledCourseValidator,
    updateProgressValidator
} = require("../validators/enrollment.schema")
const {
    createEnrollment,
    getEnrolledCourses,
    getEnrolledCourse,
    cancelEnrollment,
    updateProgress
} = require("../controllers/enrollment.controller")

const enrollmentRouter = Router()

// A user's own enrollments. Any authenticated role, because a user may
// be promoted to teacher after enrolling.
enrollmentRouter.get(
    "/me",
    logger,
    auth,
    getEnrolledCourses)

// Course content for enrolled students. Works even when the course is
// unpublished or archived, as long as the enrollment is active.
enrollmentRouter.get(
    "/course/:courseId",
    logger,
    auth,
    validator(enrolledCourseValidator),
    getEnrolledCourse)

// Leave a course (removes the enrollment document).
enrollmentRouter.delete(
    "/:id",
    logger,
    auth,
    validator(idValidator),
    cancelEnrollment)

enrollmentRouter.post(
    "/:courseId",
    logger,
    auth,
    restrictTo("user"),
    validator(enrollmentValidator),
    createEnrollment
)

enrollmentRouter.patch(
    "/:id/progress",
    logger,
    auth,
    validator(updateProgressValidator),
    updateProgress
)

module.exports = enrollmentRouter
