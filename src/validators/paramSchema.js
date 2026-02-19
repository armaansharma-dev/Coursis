const {z} = require("zod")

// Route parameter schema    // PARAMS validation (:id)

const idSchema = z.object({
    id : z.string().length(24),
})

// Query parameter schema    // QUERY validation (?page=1&limit=10)

const filterSchema = z.object ({
    category : z.string().optional(),
    minPrice : z.coerce.number().min(999).optional(),
    maxPrice : z.coerce.number().max(9999).optional(),
}).strict()

const paginationSchema = z.object({
    page : z.coerce.number().min(1).default(1),
    limit : z.coerce.number().min(1).max(50).default(10),
})

module.exports = {
    idSchema,
    filterSchema,
    paginationSchema,
}