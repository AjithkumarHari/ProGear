const cartData = require('../Model/cartModel')
const Product = require("../Model/productModel")
const mongoose = require('mongoose')
const cartHelper = require('../Helper/cartHelper');




module.exports.cartPage = async ( req, res ) => {
    try{
      console.log('cart page loaded');
      const user = res.locals.user
      // console.log('id', user.id);
      
      const cart = await cartData.aggregate([
        {
          $match: {
            user_id: user.id
          }
        },
        {
          $unwind: "$product"
        },{
          $project:{
            item: "$product.product_id",
                quantity: "$product.quantity",
            user : "$user_id",
            subtotal : "$sub_total"
          },
        },
        {
          $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "carted"
              }
        },
         {
          $project: {
            "item": 1,
            "quantity": 1,
            "carted": { $arrayElemAt: ["$carted", 0] },
            "user" : 1,
            "total": {
              $let: {
                vars: {
                  price: { $arrayElemAt: ["$carted.price", 0] }
                },
                in: { $multiply: ["$quantity", "$$price"] }
              }
            },
           
          },
        }, 
      ]);
      const subtotal = await cartData.aggregate([
        {
          $match: {
            user_id: user.id
          }
        },
        {
          $unwind: "$product"
        },
        {
          $group: {
            _id: "$_id",
            user_id: { $first: "$user_id" },
            totalSum: { $sum: "$product.total" }
          }
        },
        {
          $project: {
            _id: 0,
            totalSum: 1
          }
        }
      ]);
      
      console.log('cart page subtotal ',subtotal);
      // console.log('cart:',cart);
      res.render('cart', {cart:cart, subtotal});
      
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}


  




module.exports.addToCart = async (req , res) => {
    try{
    //    const productId = new mongoose.Types.ObjectId(req.params.id)
    //    console.log('add to cart',productId);
       
    //     const product = cartData
        
        
    //     .findOne(
    //       {
    //         "product.product_id": productId
    //       },
    //       {
    //         "product.$.quantity": 1
    //       })

    //  const quantity = product._userProvidedFields.product.$.quantity
   





    //     if (product) {
    //       console.log("Product:", quantity);
    //     } else {
    //       console.log("Product not found.");
    //     }
     
  
        // cartHelper.addCart(req.params.id,res.locals.user.id,)
        cartHelper.addCart(req.params.id,res.locals.user.id,req.params.price)
        .then((response)=>{
          res.send(response)
        }) 
    }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to add product to cart ' });
    }


}






module.exports.removeFromCart = async (req, res )=>{
  try{
      console.log("remove form cart");
      const id = req.query.id
      console.log('removing id',id);
      const result = await cartData.updateOne(
        { user_id: res.locals.user.id }, // Match the user_id
        { $pull: { product: { product_id: new mongoose.Types.ObjectId(id) } } } // Remove the matching product_id from the product array
      );
      // console.log(result);
      res.redirect('/cart')
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}




module.exports.changeItemQuantity = async (req, res )=>{
  try{
      console.log(" called change item quantity");
      // const id = req.query.id
      // console.log("body :",req.body);
      cartHelper.changeProductQuantity(req.body)
        .then((response)=>{
          res.send(response)
        }) 
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}

