const mongoose = require('mongoose')

const details = new mongoose.Schema({


    user_data : {
        type: mongoose.Schema.Types.String,
        ref: 'userdatas',    
        required : true
    },
    address: [
        {
            name: {
                type: String
            },
            number: {
                type: Number
            },
            houseAddress: {
                type: String
            },
            street: {
                type: String
            },
            city: {
                type: String
            },
            pin: {
                type: String
            },
            is_default :{
                type : Boolean,
                required : true,
                default : false
            }
        }
    ]
})

module.exports = mongoose.model('address',details)
