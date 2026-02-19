const {z} = require("zod")

const changePasswordSchema = z.object({
    currentPassword : z.string().min(8).trim(),
    newPassword : z.string().min(8).trim(),
    confirmNewPassword : z.string().min(8).trim(),
}).strict().refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"]
})

const updateProfileSchema = z.object({
    name: z.string().min(4)//.optional(),
}).strict()

const changeEmaiilSchema = z.object({
    newMail: z.string().min(4),
    password: z.string().min(8)
}).strict()

module.exports = {
    changePasswordSchema,
    updateProfileSchema,
    changeEmaiilSchema
}