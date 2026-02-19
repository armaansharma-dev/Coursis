const { Router } = require("express")

const authRouter = Router()

authRouter.post("/signup", signup)
authRouter.post("/login", login)

module.exports = {
    authRouter,
}