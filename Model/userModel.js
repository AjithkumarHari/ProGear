const mongoose = require('mongoose')

mongoose.connect("mongodb://0.0.0.0:27017/ProGear")
    .then(()=>{
        console.log('Connected');
    })
    .catch(()=>{
        console.log('Not Connected');
    })

    
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
    coupons : {
        type : Array,
    },

})

module.exports = mongoose.model('userData',details)