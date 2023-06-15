const mongoose = require('mongoose')

const details = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    is_listed : {
        type : Boolean,
        default : true
    },
})

module.exports = mongoose.model('category',details)