const cartData = require('../Model/cartModel')
const Product = require("../Model/productModel")
const mongoose = require('mongoose')
const cartHelper = require('../Helper/cartHelper');
const Category = require('../Model/categoryModel')



module.exports.cartPage = async ( req, res ) => {

      try {
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
                      console.log('subtotal', subtotal);
                    } else {
                      throw new Error('Cart is empty or invalid.');
                    }

                } 
      catch (error) {
        console.error('Error:', error.message);
      }



        console.log('cart page subtotal', subtotal);

        const category = await Category.find({ })

        if(cart==null){
        res.render('cart', { cart:[], subtotal, category , token:null});
          
        }
        else{
        res.render('cart', { cart, subtotal, category , token:null});

        }
      }
      
      
      catch (error) {
        console.error('Error:', error.message);
        res.send({ success: false, error: error.message });
      }
      
}


  




module.exports.addToCart = async (req , res) => {
    try{
  
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

