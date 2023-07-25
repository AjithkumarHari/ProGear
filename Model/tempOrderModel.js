const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orders:{
      type:Array
    }
    
  });

  const tempOrder = mongoose.model('tempOrder', orderSchema);
  module.exports =tempOrder;
