const {z} = require("zod")

const courseSchema = z.object({
    title: z.string().min(5).max(30),
    description: z.string().min(20).max(2000).trim(),
    price: z.coerce.number().min(0).max(9999),
    image: z.string().url(),
}).strict()

module.exports = {
    courseSchema,
}