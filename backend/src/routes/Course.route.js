const {Router} = require("express")
const { validator } = require("../middlewares/validator")
const {logger} = require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const {restrictTo} = require("../middlewares/restrictTo")
const {ownership} = require("../middlewares/ownership")
const {createCourseValidator, updateCourseValidator} = require("../validators/course.schema")
const {idValidator} = require("../validators/paramSchema")

const {createCourse, updateCourse, deleteCourse, togglePublish} = require("../controllers/teacher.controller")
const {publicCourses, viewCoursePublic} = require("../controllers/public.controller")
const {getEnrolledUsers} = require("../controllers/enrollment.controller")

const courseRouter = Router()

courseRouter.post(
    "/",
    logger, 
    auth,
    restrictTo("admin", "teacher"),
    validator(createCourseValidator), 
    createCourse)        

courseRouter.put(
    "/:id/publish", 
    logger,
    auth,
    restrictTo("admin", "teacher"),
    validator(idValidator),
    ownership,
    togglePublish)

courseRouter.get(
    "/:id/enrollments",
    logger,
    auth,
    restrictTo("admin", "teacher"),
    validator(idValidator),
    ownership,
    getEnrolledUsers)

courseRouter.patch(
    "/:id", 
    logger,
    auth,
    restrictTo("admin", "teacher"),
    validator(idValidator),
    ownership,
    validator(updateCourseValidator), 
    updateCourse)             

courseRouter.delete(
    "/:id", 
    logger,
    auth,
    restrictTo("admin", "teacher"),
    validator(idValidator),
    ownership, 
    deleteCourse)

courseRouter.get(
    "/", 
    logger, 
    publicCourses)

courseRouter.get(
    "/:id", 
    logger, 
    validator(idValidator), 
    viewCoursePublic)

module.exports = courseRouter