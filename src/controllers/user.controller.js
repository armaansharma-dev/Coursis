const User = require("../models/User")
const { AppError } = require("../utils/AppError")

exports.myProfile = async(req, res, next) => {
    const user = User.findById(req.user.id).select("-password")

    if(!user){
        return next(new AppError("User not found", 404))
    }

    return res.status(200).json({
        status : "success",
        data : user
    })
}

exports.updateMyProfile = async(req, res, next) => {
    const allowedFields = ["name"]
    const updates = {}

    for(let key of allowedFields){
        if(req.body[key] !== undefined){
            updates[key] = req.body[key]
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new : true , runValidators : true }
    ).select("-password")

    res.status(200).json({
        status : "success",
        data : user
    })
}

exports.changePassword = async(req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    const isCorrect = await bcrypt.compare(req.body.currentPassword, user.password)

    if(!isCorrect){
        return next(new AppError("incorrect password", 400))
    }

    user.password = req.body.newPassword
    await user.save()

    res.status(200).json({
        status : "success",
        message : "Password changed, please login again"
    })
}

exports.changeEmaiil = async(req, res, next) => {
   const {newMail, password} = req.body
   
   const user = await User.findById(req.user.id).select("+password")
   if(!user){
    return next(new AppError("User not found", 404))
   }

   const verify = await bcrypt.compare(password, user.password)
   if(!verify){
    return next(new AppError("Incorrect password", 401))
   }

   const extinguish = await User.findOne({email : newMail})
   if(extinguish){
    return next(new AppError("Email already in user", 400))
   }

   user.email = newMail
   await user.save()

   safeUser = {
    id : user._id,
    name : user.name,
    email : user.email,
   }

   res.status(200).json({
    status : "success",
    data : safeUser
   })
}