const mongoose = require('mongoose')
const wishListSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdatas",
    },
    wishList: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
  
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
});

module.exports = mongoose.model('wishList',wishListSchema)