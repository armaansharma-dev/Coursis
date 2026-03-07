const { Router } = require("express")
const { signupValidator, signinValidator } = require("../validators/auth.schema")
const {logger} =  require("../middlewares/logger")
const {signup, signin} = require("../controllers/auth.controller")

const authRouter = Router()

authRouter.post(
    "/signup", 
    logger, 
    signupValidator, 
    signup)
authRouter.post(
    "/login", 
    logger, 
    signinValidator, 
    signin)

module.exports = authRoutera