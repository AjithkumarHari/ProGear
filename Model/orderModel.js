const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userdatas',
    required: true
  },
  date : {
    type : Date,
    default : Date.now
  },
  payment_method : {
    type : String,
    required : true,
  },
  
  delivery_address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address',
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  order_status : {
    type : String,
    required : true,
    default : 'Placed'
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
    }
  ],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
