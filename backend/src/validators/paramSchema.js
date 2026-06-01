const {z} = require("zod")

// Route parameter schema    // PARAMS validation (:id)

const idSchema = z.object({
    id : z.string()
        .length(24, "Invalid ID format")
        .refine(id => /^[0-9a-f]{24}$/.test(id), "ID must be a valid MongoDB ID"),
}).strict()

// Query parameter schema    // QUERY validation (?page=1&limit=10)

const filterSchema = z.object ({
    category : z.string()
        .optional()
        .refine(val => !val || val.length > 0, "Category cannot be empty"),
    minPrice : z.coerce.number()
        .min(0, "Minimum price cannot be negative")
        .optional(),
    maxPrice : z.coerce.number()
        .max(9999, "Maximum price cannot exceed ₹9999")
        .optional(),
}).strict()

const paginationSchema = z.object({
    page : z.coerce.number()
        .min(1, "Page must be at least 1"),
    limit : z.coerce.number()
        .min(1, "Limit must be at least 1")
        .max(50, "Limit cannot exceed 50 items per page"),
}).default({page: 1, limit: 10})

module.exports = {
    idValidator : {params : idSchema},
    filterValidator : {query : filterSchema},
    paginationValidator : {query : paginationSchema},
}