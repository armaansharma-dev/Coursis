function globalerrorhandler(err, req, res, next){
    let statuscode = err.statuscode || err.statusCode || 500
    let message = err.message || "Internal Server Error"
    let errors

    // Validation errors can arrive from the validator middleware
    // or from any code that calls schema.parse() directly.
    if (err.name === "ZodError") {
        errors = err.issues || err.errors || []
        statuscode = 400
        message = errors[0]?.message || "Validation failed"
    }

    // A malformed ObjectId (e.g. /course/abc) used to become a 500.
    if (err.name === "CastError") {
        statuscode = 400
        message = `Invalid value for ${err.path || "field"}`
    }

    // Duplicate key, e.g. signing up with an email that already exists.
    if (err.code === 11000) {
        statuscode = 409
        const field = Object.keys(err.keyValue || {})[0] || "value"
        message = `${field} already in use`
    }

    // Errors explicitly attached by other middleware.
    if (err.errors && Array.isArray(err.errors)) {
        errors = err.errors
        message = errors[0]?.message || message
    }

    const payload = { success: false, message }
    if (errors && errors.length) {
        payload.errors = errors
    }

    res.status(statuscode).json(payload)
}

module.exports = {
    globalerrorhandler
}
