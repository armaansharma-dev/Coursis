const { z } = require("zod");

const updateUserRoleSchema = z.object({
  role: z.string()
    .refine(
      (val) => ["user", "teacher", "admin"].includes(val),
      "Role must be user, teacher, or admin"
    ),
});

const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 50 characters")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .optional(),
  published: z.boolean().optional(),
}).strict();

module.exports = {
  updateUserRoleValidator: { body: updateUserRoleSchema },
  updateCourseValidator: { body: updateCourseSchema },
};
