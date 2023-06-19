const mongoose = require('mongoose')

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
          },
          required: true,
          default: {}
        },
        quantity: {
          type: Number,
          default: 1
        },
      });
      

module.exports = mongoose.model('cart',details)