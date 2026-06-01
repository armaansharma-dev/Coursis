const {z} = require("zod")

const signupSchema = z.object({
    name: z.string()
        .min(4, "Name must be at least 4 characters long")
        .max(50, "Name cannot exceed 50 characters"),
    email: z.string()
        .email("Please provide a valid email address")
        .min(5, "Email is too short"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long"),
}).strict()

const signinSchema = z.object({
    email: z.string()
        .email("Please provide a valid email address"),
    password: z.string()
        .min(1, "Password is required"),
}).strict()

module.exports = ({
    signupValidator : {body : signupSchema},
    signinValidator : {body : signinSchema},
})
