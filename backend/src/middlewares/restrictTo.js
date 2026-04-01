const { AppError } = require("../utils/AppError")

function restrictTo(...roles){
 return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return next(new AppError("Forbidden",403))
    }
    next()
 }
}

module.exports = {
    restrictTo,
}