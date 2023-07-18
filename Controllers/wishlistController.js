const wishListHelper = require('../Helper/wishlistHelper')
const Category = require("../Model/categoryModel");

const getWishList = async (req, res) => {
    const user = res.locals.user;
    const category = await Category.find({ is_listed: true });
    const token = res.locals.user;
    wishListHelper.getWishListProducts(user._id).then((wishlistProducts) => {
        res.render("wishList", {
            user,
            wishlistProducts,
            category,
            token
        });
    });
}

const addWishList = async (req, res) => {
    const proId = req.body.proId;
    const userId = res.locals.user._id;
    wishListHelper.addWishList(userId, proId).then((response) => {
        res.send(response);
    });
}

const removeProductWishlist = async (req, res) => {
    const userId=res.locals.user._id
    const proId = req.body.proId;
    wishListHelper
    .removeProductWishlist(proId, userId)
    .then((response) => {
        res.send(response);
    });
}

module.exports = {
    getWishList,
    addWishList,
    removeProductWishlist
  }