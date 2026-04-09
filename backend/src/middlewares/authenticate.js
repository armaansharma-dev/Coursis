const { jwtVerify } = require("../utils/token")

function auth(req, res, next){
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message : "Unauthorized - No valid token provided"
        })
    }

    const token = header.split(" ")[1]

    try{
    const decodedData = jwtVerify(token)
    req.user = decodedData
    next()
    }catch(err){
        return res.status(401).json({
            success: false,
            message : "Unauthorized - Invalid token"
        })
    }
}

module.exports = {
    auth
}