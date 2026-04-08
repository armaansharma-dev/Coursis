const {z} = require("zod")

const courseSchema = z.object({
    title: z.string()
        .min(5, "Course title must be at least 5 characters long")
        .max(30, "Course title cannot exceed 30 characters"),
    description: z.string()
        .min(20, "Course description must be at least 20 characters long")
        .max(2000, "Course description cannot exceed 2000 characters")
        .trim(),
    price: z.coerce.number()
        .min(0, "Price cannot be negative")
        .max(9999, "Price cannot exceed ₹9999"),
    image: z.string()
        .optional()
        .refine(val => !val || val.startsWith('http'), "Image must be a valid URL if provided"),
}).strict()

const updateCourse = courseSchema.partial().extend({
    isArchived: z.boolean().optional()
})

module.exports = {
    createCourseValidator : {body : courseSchema},
    updateCourseValidator : {body : updateCourse}
}