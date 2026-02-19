    const { Router } = require("express")

    const userRouter = Router()

    userRouter.get("/my-profile", auth, myprofile)
    userRouter.patch("/update-profile", auth, updateprofile)
    userRouter.get("/my-Courses", auth, myCourses )

    module.exports = {
        userRouter,
    }