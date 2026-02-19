const { AppError } = require("../utils/AppError")

exports.notfound = (req, res, next) => {
    next(new AppError("Route not found", 404))
}