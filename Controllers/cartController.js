const cartData = require('../Model/cartModel')
const Product = require("../Model/productModel")
const mongoose = require('mongoose')
const cartHelper = require('../Helper/cartHelper');
const Category = require('../Model/categoryModel')



module.exports.cartPage = async ( req, res ) => {

      try {
        const token = res.locals.user
        console.log('cart page loaded');
        const user = res.locals.user;
      
        const cart = await cartData.aggregate([
          {
            $match: {
              user_id: user.id
            }
          },
          {
            $unwind: "$product"
          },
          {
            $lookup: {
              from: "products",
              localField: "product.product_id",
              foreignField: "_id",
              as: "carted"
            }
          },
          {
            $project: {
              "item": "$product.product_id",
              "quantity": "$product.quantity",
              "user": "$user_id",
              "carted": { $arrayElemAt: ["$carted", 0] },
              "total": { $multiply: ["$product.quantity", { $arrayElemAt: ["$carted.price", 0] }] }
            }
          }
        ]);
      
        let subtotal = 0;
            try {
              
                    if (cart && cart.length > 0) {
                      subtotal = cart.reduce((acc, item) => acc + item.total, 0);

                    } else {
                      throw new Error('Cart is empty or invalid.');
                    }

                } 
      catch (error) {
        console.error('Error:', error.message);
      }

        const category = await Category.find({ })

        if(cart==null){
        res.render('cart', { cart:[], subtotal, category , token});
          
        }
        else{
        res.render('cart', { cart, subtotal, category , token });

        }
      }
      
      
      catch (error) {
        console.error('Error:', error.message);
        res.send({ success: false, error: error.message });
      }
      
}




module.exports.addToCart = async (req , res) => {
    try{
  
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

      const user = res.locals.user.id

      cartHelper.deleteProduct(req.body,user).then((response) => {
      res.send(response);

      });
    
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}




module.exports.changeItemQuantity = async (req, res )=>{
  try{
      console.log(" called change item quantity");

      cartHelper.changeProductQuantity(req.body)
        .then((response)=>{
          res.send(response)
        }) 
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}

