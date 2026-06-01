const { AppError } = require("../utils/AppError")

function notfound (req, res, next) {
    next(new AppError("Route not found", 404))
}

module.exports = {
    notfound
}