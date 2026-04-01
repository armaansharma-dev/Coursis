const express = require ("express")
const app = express()
const cors = require("cors");
app.use(cors())
const {notfound} = require("./middlewares/notfound")
const {globalerrorhandler} = require("./middlewares/globalerrorhandler")

const adminRouter = require("./routes/Admin.route")
const authRouter = require("./routes/Auth.route")
const courseRouter = require("./routes/Course.route")
const enrollmentRouter = require("./routes/Enrollment.route")
const userRouter = require("./routes/User.route")

app.use(express.json())

app.get( "/" , function(req,res){
    res.send("Server is alive")
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/enrollment", enrollmentRouter)
app.use("/api/v1/admin", adminRouter)

app.use(notfound)

app.use(globalerrorhandler)

module.exports = {
    app
}
