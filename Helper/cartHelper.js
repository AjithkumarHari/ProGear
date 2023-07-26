const Cart = require('../Model/cartModel')
const Product = require('../Model/productModel')
const mongoose = require('mongoose')


const addCart = async (productId, userId, price) => {
  const product = await Product.findOne({_id:productId})

  let productObj = {
    product_id: productId,
    quantity: 1,
    total :0
  };

  try { 
    return new Promise(async(resolve, reject)  => {

      const quantity = await Cart.aggregate([
        { $match: { user_id: userId.toString() } },
        { $unwind: "$product" },
        { $match: { 'product.product_id': new mongoose.Types.ObjectId(productId) } },
        {$project:{'product.quantity':1}}

      ]);

      Cart.findOne({ user_id: userId }).then(async (cart) => {
        if (cart) {
          let productExist = await Cart.findOne({ user_id : userId,"product.product_id": productId });
          if (productExist) {
            if(product.stock-quantity[0].product.quantity > 0){
              Cart.updateOne(
                { user_id: userId, "product.product_id": productId },
                {
                  $inc: { "product.$.quantity": 1 },
                }
              )
              .then((response)=>{
                  resolve({ response, status: true });
              })
            }
            else{
              resolve({ status: 'outOfStock' });
            }
          }
          else{
            if(product.stock > 0){
              Cart.updateOne(
                  {user_id:userId},{$push:{product:productObj},
                }
              ).then((response)=>{
                  resolve({status:true});
              })
          }else{
            resolve({ status: 'outOfStock' });
          }
        }
        } else {
          if(product.stock > 0){
            const newCart = await Cart({
              user_id:userId,
              product:productObj,
            })
            await newCart.save().then((response)=>{
                resolve({status:true})
            })
          }else{
          resolve({ status: 'outOfStock' });
          }
        }
      });
    });
  } 
  catch (error) {
    console.log(error.message);
  }
}

const changeProductQuantity = async (data) => {
  try {
      const userId = data.userId
      const productId = new mongoose.Types.ObjectId(data.productId);
      const product = await Product.findOne({_id:productId})
      const updated = await Cart.aggregate([
        {
          $match: {
            "product.product_id": productId,
          },
        },
        {
          $project: {
            product: {
              $filter: {
                input: "$product",
                as: "prod",
                cond: { $eq: ["$$prod.product_id", productId] },
              },
            },
          },
        },
        {
          $unwind: "$product", // Unwind the array to get the single matching product as an object
        },
        {
          $project: {
            quantity: "$product.quantity",
            // Add more fields here if needed
            _id:0
          },
        },
      ]).exec();
      const quantity =updated[0].quantity
      const cartFind = await Cart.findOne({ user_id: userId });
      const cartId = cartFind._id;
      const count = data.count;
    
      if(product.stock-quantity < 1 && count==1){
        const response = {outOfStock : true}
            return response
      }else{
      const cart = await Cart.findOneAndUpdate(
        { user_id: userId, 'product.product_id': productId },
        { $inc: { 'product.$.quantity': count } },
        { new: true }
        ).populate('product.product_id' );

      const cartt = await Cart.aggregate([
        {
          $match: {
            user_id: userId,
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "products",
            localField: "product.product_id",
            foreignField: "_id",
            as: "carted",
          },
        },
        {
          $project: {
            item: "$product.product_id",
            quantity: "$product.quantity",
            user: "$user_id",
            carted: { $arrayElemAt: ["$carted", 0] },
            total: {
              $multiply: [
                "$product.quantity",
                { $arrayElemAt: ["$carted.price", 0] },
              ],
            },
          },
        },
      ]);
      const updatedProductt = cartt.find(product => product.item._id.equals(productId));
      updatedProductt.total = updatedProductt.carted.price * updatedProductt.quantity;
      await cart.save();
      //   Check if the quantity is 0 or less
      if (updatedProductt.quantity <= 0) {
          const deletedcartt = cartt.filter((product) => !product.item._id.equals(productId));
          const removed = await Cart.updateOne({ user_id: userId }, { $pull: { product: { product_id: productId } } });
          const response = {deleteProduct : true}
          return response
      }
      // Calculate the new subtotal for all products in the cart
      const subtotal = cartt.reduce((acc, item) => {
        return acc + item.total; // Make sure 'total' is the correct property name
      }, 0);
      const response = {
          quantity: updatedProductt.quantity,
          total : updatedProductt.total,
          subtotal: subtotal
      };
      return response
    } 
  } catch (error) {
      console.log(error);
  }
}




const getCart = async(userId)=>{
  try {
 
    const cart = await Cart.findOne({ user_id : userId })
    .lean().exec()

        if(cart){
          return cart
        }
      else{
        return null
      }

  }
catch (error) {
  console.log(error.message);
}
}

const deleteProduct =  async (data,user) => {

  const proId = data.proId;
  
  return new Promise((resolve, reject) => {
    try {
      
       Cart.updateOne( 
       
        { user_id: user }, 
        { 
          $pull: { product: { product_id: new mongoose.Types.ObjectId(proId) } } 
         
        }
      )

      .then(() => {
        resolve({ status: true });
      });
    } catch (error) { 
      throw error;
   }
  });
}

module.exports = {
  addCart,
  changeProductQuantity,
  getCart,
  deleteProduct
}
