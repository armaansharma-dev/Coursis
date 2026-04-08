const {Router} = require("express")
const {logger} = require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const { validator } = require("../middlewares/validator")
const {myProfile, updateMyProfile, changePassword, changeEmail} = require("../controllers/user.controller")
const {changePasswordValidator, updateProfileValidator, changeEmailValidator} = require("../validators/user.schema")

const userRouter = Router()

userRouter.get("/me",
    logger,
    auth,
    myProfile)

userRouter.patch("/me",
    logger,
    auth,
    validator(updateProfileValidator),
    updateMyProfile)

userRouter.patch("/me/password",
    logger,
    auth,
    validator(changePasswordValidator),
    changePassword)

userRouter.patch("/me/email",
    logger,
    auth,
    validator(changeEmailValidator),
    changeEmail)

module.exports = userRouter