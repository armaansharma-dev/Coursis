const {z} = require("zod")

const enrollmentSchema = z.object({
   courseId : z.string().length(24),            // as they both are mongoDb object ID they would have 24 chars fixed.
}).strict()

const updateProgressSchema = z.object({
   progress : z.number().min(0).max(100),
}).strict()

module.exports = {
    enrollmentSchema,
    updateProgressSchema
}