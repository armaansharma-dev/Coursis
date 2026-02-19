const JWT = require("jsonwebtoken")

function auth(req, res, next){
    const header = req.headers.authorization

    if (!header || !header.startwtith("Bearer ")){
        return res.status(401).json({
            message : "Unaoutherized"
        })
    }

    const token = header.split(" ")[1]

    try{
    const decodedData = jwtverify(token)
    req.user = decodedData
    next()
    }catch{
        return res.status(401).json({
            message : "Unauthorized"
        })
    }
}

module.exports = {
    auth,
}