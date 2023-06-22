const Cart = require('../Model/cartModel')

const addCart = (productId, userId) => {

  let productObj = {
    product_id: productId,
    quantity: 1
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
                $inc: { "product.$.quantity": 1 }
              }
            ).then((response) => {
              resolve({ response, status: false });
            });

          } else {
            Cart.updateOne(
              { user_id: userId },
              { $push: { product: productObj } }
            ).then((response) => {
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

module.exports = {
  addCart
};
