function globalerrorhandler(err, req, res, next){
    const statuscode = err.statuscode || 500
    const message = err.message || "Internal Server Error"

    // Return validation errors from validator middleware
    if (err.errors && Array.isArray(err.errors)) {
        const firstError = err.errors[0]
        const errorMessage = firstError?.message || message
        return res.status(statuscode).json({
            success: false,
            message: errorMessage,
            errors: err.errors
        })
    }

    res.status(statuscode).json({
        success : false,
        message : message
    })
}

module.exports = {
    globalerrorhandler
}