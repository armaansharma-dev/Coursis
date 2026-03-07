const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")

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
    const allowedFields = ["title", "description", "price", "image"]
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
    await req.course.deleteOne()

    res.status(204).json({
        status : "success",
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
    const myCourses = await Course.find({creator : req.user.id})

    res.status(200).json({
        status: "success",
        data: myCourses,
        count: myCourses.length
    })
})