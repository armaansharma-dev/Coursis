const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET

exports.jwtSign = (user) => {
        const token = jwt.sign({
            id : user._id,
            role : user.role
        },secret,
        {expiresIn: '7h'})
        return token
}

exports.jwtVerify = (token) => {
        const decodedData = jwt.verify(token, secret)
        return decodedData
}