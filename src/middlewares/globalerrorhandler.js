function globalerrorhandler(err, req, res, next){
    const statuscode = err.statuscode || 500
    const message = err.message || "Interal Server Error"
    
    res.status(statuscode).json({
        success : false,
        message : err.message
    })
}

module.exports = {
    globalerrorhandler,
}