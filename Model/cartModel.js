const mongoose = require('mongoose')

  const details = new mongoose.Schema({
      user_id: {
        type: String,
        required: true
      },
      product: [
        {
          product_id: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'products',
                  required: true
                },
          quantity: {
                  type: Number,
                  default: 1
                },
          total: {
                  type : Number,
                }
        }
    ],
  });


module.exports = mongoose.model('cart',details)