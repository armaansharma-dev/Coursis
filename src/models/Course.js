const mongoose = require("mongoose");
const Schema = mongoose.Schema
const ObjectID = mongoose.Schema.Types.ObjectId

const CourseSchema = new Schema({
title : {
    type :String,
    required : true,
    trim : true,
    minLength: 3,
    maxLength: 30,
},

description : {
    type: String,
    required : true,
    minLength: 10
},

price : {
    type : Number,
    required : true,
    min : 0
},

image : {
    type : String,
    required : true
},

published : {
    type : Boolean,
    default : fasle
},
    
creator : {
        type : ObjectID, 
        ref: "User",
        immutable : tue,
        required: true
    }
}).strict()

module.exports = mongoose.model("Course", CourseSchema)