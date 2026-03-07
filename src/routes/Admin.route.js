const {Router} = require("express")

const {logger} = require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const {restrictTo} = require("../middlewares/restrictTo")
const {idValidator} = require("../validators/paramSchema")
const {ownership} = require("../middlewares/ownership")
const {changeRoleValidator} = require("../validators/user.schema")
const {deleteCourseAny, togglePublishAny, getAllCourses, getAllUsers, deleteUser, UpdateUserRole} = require("../controllers/admin.controller")
const {getEnrolledCoursesAdmin} = require("../controllers/enrollment.controller")

const adminRouter = Router()
adminRouter.use(auth, restrictTo("admin"))

adminRouter.get(
    "/courses",
    logger,
    getAllCourses
)
adminRouter.put(
    "/courses/:id/publish",
    logger,
    idValidator,
    ownership,
    togglePublishAny
)
adminRouter.delete(
    "/courses/:id",
    logger,
    idValidator,
    deleteCourseAny
)

adminRouter.get(
    "/users",
    logger,
    getAllUsers
)

adminRouter.delete(
    "/users/:id",
    logger,
    idValidator,
    deleteUser
)

adminRouter.patch(
    "/users/:id/role",
    logger,
    idValidator,
    changeRoleValidator,
    UpdateUserRole
)

adminRouter.get(
   "/users/:id/enrollments",
   logger,
   idValidator,
   getEnrolledCoursesAdmin
)

module.exports = adminRouter
