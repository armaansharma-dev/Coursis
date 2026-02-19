const express = require ("express")
const app = express()

app.use(express.json())

app.get( "/" , function(req,res){
    res.send("Server is alive")
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/enrollment", enrollmentRouter)

app.all("*", notFound)

app.use(globalErrorHandler)

module.exports = {
    app,
}
