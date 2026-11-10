const { asyncWrapper } = require("../middlewares/catchAsync")
const Course = require("../models/Course")
const { AppError } = require("../utils/AppError")

// Fisher-Yates shuffle: unbiased and easy to read.
// Fine for a few hundred courses; switch to an aggregation with
// { $sample: { size: 6 } } if the catalogue ever gets huge.
function shuffle(items) {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

exports.publicCourses = asyncWrapper(async(req, res, next) => {
    const courses = await Course.find({
        published : true,
        isArchived : false
    }).populate("creator", "name email")

    res.status(200).json({
        status : "success",
        results : courses.length,
        data : courses
    })
})

exports.viewCoursePublic = asyncWrapper(async(req, res, next) => {
    const course = await Course.findOne({
        _id : req.params.id,
        published : true,
        isArchived : false
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
    const courses = await Course.find({
        published : true,
        isArchived : false
    }).populate("creator", "name email")

    const randomCourses = shuffle(courses).slice(0, 6)

    // Returning an empty array (200) is friendlier than a 404:
    // the homepage can show an empty state instead of an error.
    res.status(200).json({
        status : "success",
        results : randomCourses.length,
        data : randomCourses
    })
})
