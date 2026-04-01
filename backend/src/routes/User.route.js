const {Router} = require("express")
const {logger} = require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const {myProfile, updateMyProfile, changePassword, changeEmail} = require("../controllers/user.controller")

const userRouter = Router()

userRouter.get("/me",
    logger,
    auth,
    myProfile)

userRouter.patch("/me", 
    logger,
    auth,
    updateMyProfile)

userRouter.patch("/me/password",
    logger,
    auth,
    changePassword)

userRouter.patch("/me/email",
    logger,
    auth,
    changeEmail)

module.exports = userRouter