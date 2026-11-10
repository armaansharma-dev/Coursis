const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")

exports.createCourse = asyncWrapper(async(req, res, next) => {
    const allowedFields = ["title", "description", "price", "image"]
    const data = {}

    for(let key of allowedFields){
        if(req.body[key] !== undefined){
            data[key] = req.body[key]
        }
    }

    const course = await Course.create({
        ...data,
        lastModifyBy : req.user.id,
        lastModifyAt : Date.now(),
        creator : req.user.id
    })

    res.status(201).json({
        status : "success",
        data : course
    })
})

exports.updateCourse = asyncWrapper(async(req, res, next) => {
    const allowedFields = ["title", "description", "price", "image", "isArchived"]
    const updates = {}

    for(let key of allowedFields){
        if(req.body[key] !== undefined){
            updates[key] = req.body[key]
        }
    }

    Object.assign(req.course, updates)

    req.course.lastModifyBy = req.user.id
    req.course.lastModifyAt = Date.now()

    await req.course.save()

    res.status(200).json({
        status : "success",
        data : req.course
    })
})

exports.deleteCourse = asyncWrapper(async(req, res, next) => {
    // MongoDB has no foreign keys, so enrollments pointing at this
    // course would survive as orphan documents. Remove them first.
    await Enrollment.deleteMany({course : req.course._id})
    await req.course.deleteOne()

    res.status(200).json({
        status : "success",
        message : "Course deleted successfully"
    })
})

exports.togglePublish = asyncWrapper(async(req, res, next) => {
    req.course.published = !Boolean(req.course.published)
    
    req.course.lastModifyBy = req.user.id
    req.course.lastModifyAt = Date.now()
    
    await req.course.save()

    res.status(200).json({
        status : "success",
        data : req.course
    })
})

exports.getMyCourses = asyncWrapper(async(req, res, next) => {
    const myCourses = await Course.find({creator : req.user.id}).lean()

    // One aggregate for all courses instead of one HTTP request per course.
    const counts = await Enrollment.aggregate([
        { $match : { course : { $in : myCourses.map(course => course._id) } } },
        { $group : { _id : "$course", count : { $sum : 1 } } }
    ])

    const countByCourse = new Map(
        counts.map(item => [item._id.toString(), item.count])
    )

    const data = myCourses.map(course => ({
        ...course,
        enrollmentCount : countByCourse.get(course._id.toString()) || 0
    }))

    res.status(200).json({
        status: "success",
        data,
        count: data.length
    })
})