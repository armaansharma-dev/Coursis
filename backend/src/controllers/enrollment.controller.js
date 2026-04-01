const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const { AppError } = require("../utils/AppError")

exports.createEnrollment = asyncWrapper(async function createEnrollment(req, res, next){
    const userID = req.user.id
    const courseID = req.params.courseID

    const course = await Course.findOne({_id : courseID})
    if(!course){
        return next(new AppError("Course doesnt exists", 400))
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
        enrollment : enroll._id,
        courseID : courseID,
        status : enroll.status
    })
})

exports.getEnrolledCourses = asyncWrapper(async function getEnrolledCourses(req, res, next){
    const userID = req.user.id
    
    const myEnrollments = await Enrollment.find({user : userID}).populate("course", "title description price createdAt")
    if(myEnrollments.length === 0){
        return res.status(200).json({
            success : true,
            message : "No enrolled courses found",
            enrollments : []
        })
    }
    
    return res.status(200).json({
        success : true,
        count : myEnrollments.length,
        enrollments : myEnrollments
    })
})

exports.getEnrolledUsers = asyncWrapper(async function getEnrolledUsers(req, res, next){
    const courseID = req.course.id
    
    const myEnrollments = await Enrollment.find({Course : courseID}).populate("user", "name email createdAt")
    if(myEnrollments.length === 0){
        return res.status(200).json({
            success : true,
            message : "No enrolled Users found",
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

    const enrollment = await Enrollment.findOne({user: userID,
   course: courseID})
    if(!enrollment){
        return next(new AppError("Enrollment doesnt exist",404))
    }

    if(enrollment.user.toString() !== userID.toString()){
       return next(new AppError("User not enrolled",404))
    }

    enrollment.progress = progress
    await enrollment.save()

    return res.status(200).json({
        success : true,
        update,
        progress
    })
})

exports.cancelEnrollment = asyncWrapper(async function cancelEnrollment(req, res, next){
    const userID = req.user.id
    const enrollmentID = req.params.id

    const enrollment = await Enrollment.findOne({_id : enrollmentID})
    if(!enrollment){
        return next(new AppError("Enrollment doesnt exist",404))
    }

    if(enrollment.user.toString() !== userID.toString()){
       return next(new AppError("User not enrolled",404))
    }


    enrollment.status = "refunded"
    await enrollment.save()

    return res.status(201).json({
        success : true,
        status : enrollment.status,
        enrollmentID
    })
})

exports.getEnrolledCoursesAdmin = asyncWrapper(async function getEnrolledCoursesAdmin(req, res, next){
    const {id} = req.params

    const enrollment = await Enrollment.find({user : id}).populate("course", "title description published")
    if(enrollment.length === 0){
        return next (new AppError("no enrollments found"))
    }

    res.status(200).json({
        success : true,
        count : enrollment.length,
        enrollment
    })
})