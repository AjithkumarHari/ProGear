const mongoose = require('mongoose')

const details = new mongoose.Schema({

    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',    
        required : true
    },
    product : {
        type : Object,
        required : true,
    },
})

module.exports = mongoose.model('cart',details)