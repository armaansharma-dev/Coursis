const User = require("../models/User")
const authSchema = require("../validators/auth.schema")
const AppError = require("../utils/AppError")
const {hasher, compare, jwtSign} = require("../utils")

async function signup(req, res, next){
    const{name, email, password} = req.body

    const extinguish = await User.findOne({email})
    if(extinguish){
        return next(new AppError("Email already in use", 400))
    }

    const hashed = await hasher(password)

    const user = await User.create({
        name,
        email,
        password: hashed,
    })

    const token = jwtSign(user)

    const safeuser = {
        name : user.name,
        email: user.email,
        role: user.role,
        userID : user._id
    }

    return res.status(201).json({
        token,
        safeuser
    })
}

async function signin(req, res, next){
    const email = req.body.email
    const plainPassword = req.body.password

    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new AppError("User doesnt exists", 400))
    }

    const valid = await compare(plainPassword, user.password)
    if(!valid){
        return next(new AppError("incorrect password", 400))
    }

    const token = jwtSign(user)
    
    const safeuser = {
        name: user.name,
        email: user.email,
        role: user.role,
        userID: user._id
    }

    return res.status(200).json({
        token,
        safeuser
    })
}