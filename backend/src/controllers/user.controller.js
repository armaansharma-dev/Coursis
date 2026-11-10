const { asyncWrapper } = require("../middlewares/catchAsync")
const User = require("../models/User")
const { AppError } = require("../utils/AppError")
const { compare, hasher } = require("../utils/Hasher")

exports.myProfile = asyncWrapper(async(req, res, next) => {
    const user = await User.findById(req.user.id).select("-password")

    if(!user){
        return next(new AppError("User not found", 404))
    }

    return res.status(200).json({
        status : "success",
        data : user
    })
})

exports.updateMyProfile = asyncWrapper(async(req, res, next) => {
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

    if(!user){
        return next(new AppError("User not found", 404))
    }

    res.status(200).json({
        status : "success",
        data : user
    })
})

exports.changePassword = asyncWrapper(async(req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    if(!user){
        return next(new AppError("User not found", 404))
    }

    const isCorrect = await compare(req.body.currentPassword, user.password)

    if(!isCorrect){
        return next(new AppError("incorrect password", 400))
    }

    // The User model has no pre-save hook, so this MUST be hashed here.
    // Storing the raw password would make bcrypt.compare() fail forever.
    user.password = await hasher(req.body.newPassword)
    await user.save()

    res.status(200).json({
        status : "success",
        message : "Password changed, please login again"
    })
})

exports.changeEmail = asyncWrapper(async(req, res, next) => {
   const {newMail, password} = req.body
   
   const user = await User.findById(req.user.id).select("+password")
   if(!user){
    return next(new AppError("User not found", 404))
   }

   const verify = await compare(password, user.password)
   if(!verify){
    return next(new AppError("Incorrect password", 401))
   }

   const extinguish = await User.findOne({email : newMail})
   if(extinguish){
    return next(new AppError("Email already in use", 400))
   }

   user.email = newMail
   await user.save()

   // Same shape as GET /user/me so the profile page can swap it in safely.
   const safeUser = {
    _id : user._id,
    name : user.name,
    email : user.email,
    role : user.role,
    createdAt : user.createdAt,
   }

   res.status(200).json({
    status : "success",
    data : safeUser
   })
})
