class AppError extends Error{
    constructor(message, statuscode){
        super(message)
        this.statuscode = statuscode
        this.message = message
        this.success = false
        this.status = "fail"
    }
}

module.exports = {
    AppError,
}