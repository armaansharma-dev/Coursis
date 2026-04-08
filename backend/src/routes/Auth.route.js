const { Router } = require("express")
const { validator } = require("../middlewares/validator")
const { signupValidator, signinValidator } = require("../validators/auth.schema")
const {logger} =  require("../middlewares/logger")
const {signup, signin} = require("../controllers/auth.controller")

const authRouter = Router()

authRouter.post(
    "/signup", 
    logger, 
    validator(signupValidator), 
    signup)
authRouter.post(
    "/login", 
    logger, 
    validator(signinValidator), 
    signin)

module.exports = authRouter