exports.validator = (schema) => {
    return(req, res, next) => {
        try{
        if(schema.body){
            req.body = schema.body.parse(req.body)
        }
        
        if(schema.params){
            req.params = schema.body.parse(req.params)
        }
        
        if(schema.query){
            req.query = schema.body.parse(req.query)
        }
        next()
    }catch(err){
        next(err)
    }
    }
}