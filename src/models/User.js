const mongoose = require("mongoose");
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    email : {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    
    password : {
        type: String,
        select : false,
    },
    
    role: {
        type: String, 
        enum: ["admin", "user", "teacher"],
        default : "user",
        immutable : true
    }
})

module.exports = mongoose.model("User", UserSchema)