const jwt = require("jsonwebtoken")

const secret = process.env.JWT_SECRET
if(!secret){
        throw new Error('JWT secret missing: set JWT_SECRET in backend/.env (copy .env.example if needed)')
}

exports.jwtSign = (user) => {
        const token = jwt.sign({
            id : user._id.toString(),
            role : user.role
        },secret,
        {expiresIn: '7h'})
        return token
}

exports.jwtVerify = (token) => {
        const decodedData = jwt.verify(token, secret)
        return decodedData
}