const { asyncWrapper } = require("../middlewares/catchAsync")
const User = require("../models/User")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const { AppError } = require("../utils/AppError")

exports.createEnrollment = asyncWrapper(async function createEnrollment(req, res, next){
    const userID = req.user.id
    const courseID = req.params.courseId

    // Check if user still exists
    const user = await User.findById(userID)
    if(!user){
        return next(new AppError("User not found or has been deleted", 401))
    }

    const course = await Course.findOne({_id : courseID})
    if(!course || !course.published){
        return next(new AppError("Course doesn't exist or is not available", 400))
    }

    const enrollment = await Enrollment.findOne({user : userID, course : courseID})
    if(enrollment){
        return next(new AppError("User already enrolled in the course", 400))
    }

    const enroll = await Enrollment.create(
        {
            user : userID,
            course : courseID,
            priceBought : course.price,
            status : "active"
        }
    )

    return res.status(201).json({
        success : true,
        message : "Enrolled successfully",
        data : {
            enrollmentId : enroll._id,
            courseId : courseID,
            status : enroll.status
        }
    })
})

exports.getEnrolledCourses = asyncWrapper(async function getEnrolledCourses(req, res, next){
    const userID = req.user.id

    // Check if user still exists
    const user = await User.findById(userID)
    if(!user){
        return next(new AppError("User not found or has been deleted", 401))
    }

    const myEnrollments = await Enrollment.find({user : userID}).populate("course", "title description price createdAt")
    if(myEnrollments.length === 0){
        return res.status(200).json({
            success : true,
            message : "No enrolled courses found",
            data : []
        })
    }

    return res.status(200).json({
        success : true,
        data : myEnrollments
    })
})

exports.getEnrolledUsers = asyncWrapper(async function getEnrolledUsers(req, res, next){
    const courseID = req.params.id

    // Check if teacher is accessing their own course
    if(req.user.role === "teacher" && req.course.creator.toString() !== req.user.id.toString()){
        return next(new AppError("Cannot view other teachers' enrollments", 403))
    }

    const myEnrollments = await Enrollment.find({course : courseID}).populate("user", "name email createdAt")
    if(myEnrollments.length === 0){
        return res.status(200).json({
            success : true,
            message : "No enrolled Users found",
            count: 0,
            enrollments : []
        })
    }

    return res.status(200).json({
        success : true,
        count : myEnrollments.length,
        enrollments : myEnrollments
    })
})

exports.updateProgress = asyncWrapper(async function updateProgress(req, res, next){
    const userID = req.user.id
    const {progress} = req.body
    const courseID = req.params.id

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return next(new AppError("Progress must be a number between 0 and 100", 400))
    }

    const enrollment = await Enrollment.findOne({user: userID,
   course: courseID})
    if(!enrollment){
        return next(new AppError("Enrollment doesn't exist",404))
    }

    if(enrollment.user.toString() !== userID.toString()){
       return next(new AppError("User not enrolled",404))
    }

    enrollment.progress = progress
    await enrollment.save()

    return res.status(200).json({
        success : true,
        message: "Progress updated successfully",
        progress,
        data: enrollment
    })
})