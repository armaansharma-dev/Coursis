const mongoose = require("mongoose");
const Schema = mongoose.Schema
const ObjectID = mongoose.Schema.Types.ObjectId

const EnrollmentSchema = new Schema({
    user : {
        type : ObjectID,
        ref: "User",
        required: true,
        immutable : true
    },
    course : {
        type : ObjectID, 
        ref: "Course", 
        required: true,
        immutable : true
    },

    purchasedAt : {
        type : Date, 
        default: Date.now,
        immutable : true
    },
    
    progress : {
        type : Number, 
        default: 0
    },
    
    status: {
        type : String, 
        enum: ["active", "expired", "refunded", "completed"], 
        default: "active"
    },

    priceBought: {
        type: Number,
        required: true,
        immutable : true
    }
})

 EnrollmentSchema.index(
        {user : 1, course :1},
        {unique : true}
    )

module.exports = mongoose.model("Enrollment", EnrollmentSchema)