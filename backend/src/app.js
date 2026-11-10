const express = require ("express")
const app = express()
const cors = require("cors");

// Comma-separated list so localhost, 127.0.0.1, LAN and deployed
// domains can all be allowed without editing code.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header (curl/Postman/same-origin) is always allowed.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true
}))
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
