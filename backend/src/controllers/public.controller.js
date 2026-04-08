const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const { AppError } = require("../utils/AppError")

exports.publicCourses = asyncWrapper(async(req, res, next) => {
    const courses = await Course.find({published : true}).populate("creator", "name email")

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
    }).populate("creator", "name email")

    if(!course){
        return next(new AppError("Course not found", 404))
    }

    res.status(200).json({
        status : "success",
        data : course
    })
})

exports.getRandomCourses = asyncWrapper(async (req, res, next) => {
    const count = await Course.countDocuments({published : true, isArchived : false});
    if (count === 0) return next(new AppError("No courses found", 404));

    const random = Math.floor(Math.random() * count);
    const courses = await Course.find({published : true, isArchived : false}).populate("creator", "name email").skip(random).limit(6);

    res.status(200).json({
        status: "success",
        data: courses
    });
});