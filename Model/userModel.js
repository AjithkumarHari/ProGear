const mongoose = require('mongoose')
    
const details = new mongoose.Schema({
    fname:{
        type: String,
        required : true
    },
    lname:{
        type: String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    number : {
        type : String,
        required : true
    },
    is_blocked : {
        type : Boolean,
        required : true,
        default : false
    },
    wallet : {
        type : Number,
        default : 0
    },
    walletTransaction:{
        type:Array
    },
    coupons : {
        type : Array,
    },

})

module.exports = mongoose.model('userData',details)