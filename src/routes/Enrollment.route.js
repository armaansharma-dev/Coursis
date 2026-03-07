const {Router} = require("express")
const {logger} = require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const {restrictTo} = require("../middlewares/restrictTo")
const {ownership} = require("../middlewares/ownership")
const {idValidator} = require("../validators/paramSchema")

const {enrollmentValidator, updateProgressValidator} = require("../validators/enrollment.schema")
const {createEnrollment, getEnrolledCourses, updateProgress, cancelEnrollment} = require("../controllers/enrollment.controller")

const enrollmentRouter = Router()

enrollmentRouter.get(
    "/me",
    logger,
    auth,
    restrictTo("user"),
    getEnrolledCourses)

enrollmentRouter.post(
    "/:courseId",
    logger,
    auth,
    restrictTo("user"),
    idValidator,
    enrollmentValidator,
    createEnrollment
)

enrollmentRouter.patch(
    "/:courseId/progress",
    logger,
    auth,
    restrictTo("user"),
    idValidator,
    updateProgressValidator,
    updateProgress
)

enrollmentRouter.delete(
    "/:courseId",
    logger,
    auth,
    restrictTo("user"),
    idValidator,
    cancelEnrollment
)