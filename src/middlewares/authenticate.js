const { jwtVerify } = require("../utils/token")

function auth(req, res, next){
    const header = req.headers.authorization

    if (!header || !header.startsWtith("Bearer ")){
        return res.status(401).json({
            message : "Unautherized"
        })
    }

    const token = header.split(" ")[1]

    try{
    const decodedData = jwtVerify(token)
    req.user = decodedData
    next()
    }catch{
        return res.status(401).json({
            message : "Unauthorized"
        })
    }
}

module.exports = {
    auth
}