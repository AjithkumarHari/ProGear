const productData = require("../Model/productModel");
const mongoose = require("mongoose");

module.exports.productConfig = async (req, res, next) => {
    try {
        console.log('productConfig');
        const id = req.params.id;
        const isListed = await productData.aggregate([
        {
            $match: {
            _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
            },
        },
        {
            $project: {
            category: 1,
            is_listed: "$category.is_listed",
            is_product_listed : "$is_product_listed"
            },
        },
        ]);
        const categoryIsListed = isListed[0].is_listed[0];
        const productIsListed = isListed[0].is_product_listed;
        if (categoryIsListed && productIsListed) {
        next();
        } else {
        res.redirect("/error-404");
        }
    } catch (error) {
        console.log("Error in productConfig", error);
        res.redirect("/error-500");
    }
};