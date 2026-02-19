const Course = require("../models/Course")

exports.createCourse = async(req, res, next) => {
    const course = await Course.create({
        ...req.body,
        creator : req.user.id
    })

    res.status(201).json({
        status : "success",
        data : course
    })
}

exports.updateCourse = async(req, res, next) => {
    const update = await Course.findByIdAndUpdate(
        req.course._id,
        req.body,
    {new: true, runValidators : true})

    res.status(200).json({
        status : "success",
        data : update
    })
}

exports.deleteCourse = async(req, res, next) => {
    deleteCourse = await Course.findByIdAndDelete(
        req.course._id
    )

    res.status(204).json({
        status : "success",
    })
}

exports.publicCourses = async(req, res, next) => {
    const courses = await Course.find({published : true})

    res.status(200).json({
        status : "success",
        results : courses.length,
        data : courses
    })
}

exports.togglePublish = async(req, res, next) => {
    req.course.published = !req.course.published
    await req.course.save()

    res.status(200).json({
        status : "success",
        data : req.course
    })
}

exports.viewCourse = async(req, res, next) => {
    const course = await Course.findById(req.course._id)

    res.status(200).json({
        status : "success",
        data : course
    })
}