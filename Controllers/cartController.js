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
        }
      ]);
      
      // console.log('Cart:', cart);
      
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