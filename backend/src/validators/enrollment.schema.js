const {z} = require("zod")

const enrollmentValidator = {
   body: z.object({}).strict(),
   params: z.object({
      courseId : z.string()
         .length(24, "Invalid course ID format")
   }).strict()
}

const updateProgressValidator = {
   body: z.object({
      progress : z.number()
         .min(0, "Progress cannot be less than 0%")
         .max(100, "Progress cannot exceed 100%")
   }).strict(),
   params: z.object({
      id : z.string()
         .length(24, "Invalid enrollment ID format")
   }).strict()
}

module.exports = {
   enrollmentValidator,
   updateProgressValidator
}