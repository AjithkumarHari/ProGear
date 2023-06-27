const Cart = require('../Model/cartModel')
// const Product = require("../Model/productModel")
const mongoose = require('mongoose')





  const addCart = async (productId, userId, price) => {
  
  
  let productObj = {
    product_id: productId,
    quantity: 1,
    total :0
  };

  try {
    return new Promise((resolve, reject) => {
        console.log('cart helper');
      Cart.findOne({ user_id: userId }).then(async (cart) => {
        if (cart) {
          let productExist = await Cart.findOne({ "product.product_id": productId });

          if (productExist) {
            Cart.updateOne(
              { user_id: userId, "product.product_id": productId },
              {
                $inc: { "product.$.quantity": 1 },
                // $set: {
                //   subTotal: cart.sub_total + totalPrice, // Update the subTotal field by adding the new total price
                // },

              }
            )
            // total += product.price
            .then((response) => {
              
              resolve({ response, status: false });
            });

          } else {
            Cart.updateOne(
              { user_id: userId },
              { $push: { product: productObj } }
            )
            
            // total = product.price
            .then((response) => {
              resolve({ status: true });
            });

          }
        } else {
          let newCart = new Cart({
            user_id: userId,
            product: productObj
          });
          await newCart.save().then((response) => {
            resolve({ status: true });
          });
        }
      });
    });

  } catch (error) {
    console.log(error.message);
  }
  }


const changeProductQuantity = async (data) => {
  try {
    console.log('cpq helper');
      const userId = data.userId
      const productId = new mongoose.Types.ObjectId(data.productId);
      const quantity = data.quantity;
      const cartFind = await Cart.findOne({ user_id: userId });
      const cartId = cartFind._id;
      const count = data.count;
      // console.log(userId,"userId");
      // console.log(productId,'productid');
      // console.log(quantity,'quantity');
      // console.log(cartId,'cartId');
      // console.log(count,'count');
      
     
// Find the cart for the given user and product
      const cart = await Cart.findOneAndUpdate(
      { user_id: userId, 'product.product_id': productId },
      { $inc: { 'product.$.quantity': count } },
      { new: true }
      ).populate('product.product_id');


      // console.log('helper cart',cart);
      // console.log('cart.poroduct',cart.product);

      // Update the total for the specific product in the cart
      const updatedProduct = cart.product.find(product => product.product_id._id.equals(productId));
      updatedProduct.total = updatedProduct.product_id.price * updatedProduct.quantity;
      console.log('updateproduct',updatedProduct.total);
      
      await cart.save();

      //   Check if the quantity is 0 or less
      if (updatedProduct.quantity <= 0) {
      // Remove the product from the cart
          cart.product = cart.product.filter(product => !product.product_id._id.equals(productId));
          // console.log('cart.product',cart.product);
          await cart.save();
          const response = {deleteProduct : true}
          return response
      }

      // Calculate the new subtotal for all products in the cart
      const subtotal = cart.product.reduce((acc, product) => {
      return acc + product.total;
      }, 0);
      console.log('subtotal',subtotal);
      // Prepare the response object
      const response = {
          quantity: updatedProduct.quantity,
          total : updatedProduct.total,
          subtotal: subtotal
      };
      console.log('res',response);
      return response
      } catch (error) {
          console.log(error);
          // res.status(500).json({ error: error.message });
           }
          }


module.exports = {
  addCart,
  changeProductQuantity,
}
