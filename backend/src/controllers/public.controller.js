const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const { AppError } = require("../utils/AppError")

exports.publicCourses = asyncWrapper(async(req, res, next) => {
    const courses = await Course.find({published : true})

    res.status(200).json({
        status : "success",
        results : courses.length,
        data : courses
    })
})

exports.viewCoursePublic = asyncWrapper(async(req, res, next) => {
    const course = await Course.findOne({
        _id : req.params.id,
        published : true
    })

    if(!course){
        return next(new AppError("Course not found", 404))
    }

    res.status(200).json({
        status : "success",
        data : course
    })
})