const {z} = require("zod")

const signupSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(6),
}).strict()

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
}).strict()

module.exports = ({
    signupSchema,
    signinSchema,
})
