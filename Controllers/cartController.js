const cartData = require('../Model/cartModel')
// const userData = require('../Model/userModel')






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
          $lookup: {
            from: 'products',
            localField: 'product.product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        }, {
          $project: {
            'product._id': 1,
            'product.name': 1,
            'product.image': 1,
            'product.price': 1,
            'quantity' : 1
          }
        }
        
      ]);
      
      
      res.render('cart', { cart: cart });
      
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}


module.exports.addToCart = async (req , res) => {
    try{
        const userId = res.locals.user
        const productId = req.query.productId
    // console.log(userId);
    // console.log(productId);

    const cart = new cartData({user_id : res.locals.user.id, product: { product_id: productId, quantity: 1 }});
    const savedCategory = await cart.save();
    // console.log(savedCategory);
    res.redirect('/')
    }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
}



module.exports.removeFromCart = async (req, res )=>{
  try{
      console.log("remove form cart");
      const id = req.query.id
      console.log(id);
      const result = await cartData.deleteOne({'product.product_id' : id}) 
      // console.log(result);


      res.redirect('/cart')
  }catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }

}