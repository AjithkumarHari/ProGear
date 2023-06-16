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
    brand : {
        type : String,
        required : true
    },
    image : {
        type : Array,
        required : true
    },
    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',    
        required : true
    },
    is_product_listed : {
        type : Boolean,
        default : true
    },
    price:{
        type: Number,
        required:true
      }
    
})

module.exports = mongoose.model('products',details)