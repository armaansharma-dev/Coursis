const {z} = require("zod")

const changePasswordSchema = z.object({
    currentPassword : z.string()
        .min(1, "Current password is required"),
    newPassword : z.string()
        .min(8, "New password must be at least 8 characters long"),
    confirmNewPassword : z.string()
        .min(8, "Confirmation password must be at least 8 characters long"),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirmation password do not match",
    path: ["confirmNewPassword"]
})

const updateProfileSchema = z.object({
    name: z.string()
        .min(4, "Name must be at least 4 characters long")
        .max(50, "Name cannot exceed 50 characters")
})

const changeRoleSchema = z.object({
    role : z.enum(["user", "teacher"], {
        errorMap: () => ({message: "Role must be either 'user' or 'teacher'"})
    })
})

const changeEmailSchema = z.object({
    newMail: z.string()
        .email("Please provide a valid email address"),
    password: z.string()
        .min(1, "Password is required to change email"),
})

module.exports = {
    changePasswordValidator : {body : changePasswordSchema},
    updateProfileValidator : {body : updateProfileSchema},
    changeEmailValidator : {body : changeEmailSchema},
    changeRoleValidator : {body : changeRoleSchema}
}