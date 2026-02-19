const Course = require("../models/Course")
const { AppError } = require("../utils/AppError")

exports.ownership = async(req, res, next) => {
    const course = await Course.findById(req.params.id)
    if(!course){
       return next(new AppError("course does not exist", 400))
    }

    if(req.user.role === "admin"){
        req.course = course
        return next()
    }

    if(req.user.id.toString() !== course.creator.toString()){
        return next(new AppError("access not granted", 403))
    }

    req.course = course
    next()
}