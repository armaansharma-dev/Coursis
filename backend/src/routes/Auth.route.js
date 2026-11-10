const { Router } = require("express")
const { validator } = require("../middlewares/validator")
const { signupValidator, signinValidator } = require("../validators/auth.schema")
const {logger} =  require("../middlewares/logger")
const {auth} = require("../middlewares/authenticate")
const {signup, signin, refresh} = require("../controllers/auth.controller")

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
authRouter.get(
    "/refresh",
    logger,
    auth,
    refresh)

module.exports = authRouter