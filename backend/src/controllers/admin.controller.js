const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const User = require("../models/User")
const { AppError } = require("../utils/AppError")

exports.deleteCourseAny = asyncWrapper(async(req, res, next) => {
    const course = await Course.findById(req.params.id)
    if(!course){
        return next(new AppError("Course not found", 404))
    }

    await course.deleteOne()

    res.status(204).json({
        status : "success",
    })
})

exports.togglePublishAny = asyncWrapper(async(req, res, next) => {
    req.course.published = !(req.course.published)
    
    req.course.lastModifyBy = req.user.id
    req.course.lastModifyAt = Date.now()
    
    await req.course.save()

    res.status(200).json({
        status : "success",
        data : req.course
    })
})

exports.getAllCourses = asyncWrapper(async(req, res, next) => {
    const allCourses = await Course.find()
    .populate("creator", "name email")
    .sort("-createdAt")

    res.status(200).json({
        status: "success",
        data : allCourses,
        count : allCourses.length
    })
})

exports.getAllUsers = asyncWrapper(async(req, res, next) => {
    const users = await User.find().select("-password")

    res.status(200).json({
        success : true,
        data : users
    })
})

exports.deleteUser = asyncWrapper(async(req, res, next) => {
    const id = req.params.id

    if(id === req.user.id){
        return next(new AppError("Admin cannot delete themselves", 400))
    }

    const targetUser = await User.findById(id)
    if(!targetUser){
        return next(new AppError("User not found", 404))
    }
    if(targetUser.role === "admin"){
        return next(new AppError("Admins cannot delete other Admins", 403))
    }
    
    await targetUser.deleteOne()

    res.status(204).json({
        success : true,
        message : "User deleted"
    })
})

exports.UpdateUserRole = asyncWrapper(async(req, res, next) => {
    const {id} = req.params
    const {role} = req.body

    if(req.user.id === id){
        return next(new AppError("cannot change own role", 400))
    }

    const user = await User.findByIdAndUpdate(
        id,
        {role},
        {new : true, runValidators : true}
    )

    if(!user){
        return next(new AppError("User not found", 404))
    }
    res.status(200).json({
        success : true,
        data : user
    })
})