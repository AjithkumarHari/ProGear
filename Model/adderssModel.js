const mongoose = require('mongoose')

const details = new mongoose.Schema({


    user_data : {
        type: mongoose.Schema.Types.String,
        ref: 'userdatas',    
        required : true
    },
    address: [
        {
            address_1: {
                type: String
            },
            address_2: {
                type: String
            },
            city: {
                type: String
            },
            pin: {
                type: String
            }
        }
    ]
})

module.exports = mongoose.model('address',details)