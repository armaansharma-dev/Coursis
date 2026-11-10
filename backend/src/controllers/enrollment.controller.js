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

    const course = await Course.findOne({
        _id : courseID,
        published : true,
        isArchived : false
    })
    if(!course){
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

exports.getEnrolledCourse = asyncWrapper(async function getEnrolledCourse(req, res, next){
    const userID = req.user.id
    const courseID = req.params.courseId

    const enrollment = await Enrollment.findOne({
        user : userID,
        course : courseID,
        status : { $in : ["active", "completed"] }
    })

    if(!enrollment){
        return next(new AppError("You are not enrolled in this course", 403))
    }

    // Deliberately not filtered by published/isArchived: once a student
    // has enrolled, they keep access even if the teacher unpublishes it.
    const course = await Course.findById(courseID).populate("creator", "name email")
    if(!course){
        return next(new AppError("Course not found", 404))
    }

    return res.status(200).json({
        success : true,
        data : course,
        enrollment : {
            _id : enrollment._id,
            progress : enrollment.progress,
            status : enrollment.status,
            purchasedAt : enrollment.purchasedAt
        }
    })
})

exports.cancelEnrollment = asyncWrapper(async function cancelEnrollment(req, res, next){
    const enrollment = await Enrollment.findOneAndDelete({
        _id : req.params.id,
        user : req.user.id
    })

    if(!enrollment){
        return next(new AppError("Enrollment not found", 404))
    }

    return res.status(200).json({
        success : true,
        message : "Enrollment cancelled",
        data : { enrollmentId : enrollment._id }
    })
})

exports.updateProgress = asyncWrapper(async function updateProgress(req, res, next){
    const userID = req.user.id
    const {progress} = req.body
    // The route is /enrollment/:id/progress and the validator calls it
    // "enrollment ID", so we must look the enrollment up by its own _id.
    const enrollmentID = req.params.id

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return next(new AppError("Progress must be a number between 0 and 100", 400))
    }

    const enrollment = await Enrollment.findOne({
        _id : enrollmentID,
        user : userID
    })
    if(!enrollment){
        return next(new AppError("Enrollment doesn't exist",404))
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