const mongoose = require('mongoose')

// const details = new mongoose.Schema({

//     user_id : {
//         type: mongoose.Schema.Types.String,
//         // ref: 'user',    
//         required : true
//     },
//     product : {
//         type : Object,
//         required : true,
//         default:{
//             product_id :{
//                 type :  mongoose.Schema.Types.ObjectId,
//                         ref: 'products',    

//                 required : true
//             },
//             quantity :{
//                 type : Number,
//                 default :1
//             }
//         }
//     },
// })



const details = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    product: {
      type: {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        }
      },
      required: true,
      default: {}
    }
  });
  

module.exports = mongoose.model('cart',details)