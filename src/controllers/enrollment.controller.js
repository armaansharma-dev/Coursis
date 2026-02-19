const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const { AppError } = require("../utils/AppError")
const { enrollmentSchema } = require("../validators/enrollment.schema")

async function createEnrollment(req, res, next){
    const userID = req.user.id
    const courseID = req.body.CourseID

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
}

async function getEnrollments(req, res, next){
    const userID = req.user.id
    
    const myEnrollments = await Enrollment.find({user : userID}).populate("course")
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
}

async function updateProgress(req, res, next){
    const userID = req.user.id
    const {progress} = req.body
    const enrollmentID = req.params.id

    const enrollment = await Enrollment.findOne({_id : enrollmentID})
    if(!enrollment){
        return next(new AppError("Enrollment doesnt exist",404))
    }

    if(enrollment.user.toString() !== userID.toString()){
       return next(new AppError("User not enrolled",404))
    }

    const update = await enrollment.updateOne({progress})

    return res.status(201).json({
        success : true,
        update,
        progress
    })
}

async function cancelEnrollment(req, res, next){
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
}
