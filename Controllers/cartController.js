const cartData = require('../Model/cartModel')
// const userData = require('../Model/userModel')
const cartHelper = require('../Helper/addToCartHelper');
// const { response } = require('../Router/usersRouter');
// const { ObjectId } = require('mongoose');


module.exports.cartPage = async ( req, res ) => {
    try{
      const user = res.locals.user;
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
          }
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
          },
        }, 
      ]);

      // console.log('cart:',cart);
      res.render('cart', {cart:cart });
      
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}


  




module.exports.addToCart = async (req , res) => {
    try{
        cartHelper.addCart(req.params.id,res.locals.user.id)
        .then((response)=>{
          res.send(response)
        }) 
    }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
}






module.exports.removeFromCart = async (req, res )=>{
  try{
      console.log("remove form cart");
      const id = req.query.id
      // console.log(id);
      const result = await cartData.deleteOne({'product.product_id' : id}) 
      // console.log(result);
      res.redirect('/cart')
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}





module.exports.changeItemQuantity= async (req, res) =>{
    // console.log('called');

  try{
    const count = req.body.count;
    const productId = req.body.productId
    const qty = req.body.quantity
    console.log('qty:',qty);
    console.log('count:',count);
    console.log('pID',productId);
    // console.log(res.locals.user.id);
    if(qty == 1 && count == -1){
      const result = await cartData.findOneAndUpdate(
        { user_id: res.locals.user.id}, // Replace with the desired document ID
        { $pull: { product: { product_id: ObjectId(productId) } } }, // Replace with the desired product_id
        { new: true }
      );
    
      console.log(result);
    }

  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}