const wishListModel = require('../Model/wishlistModel')
const{ObjectId} = require('mongodb')

//to get wishlist
const getWishListProducts = async (userId) => {
    try {
        return new Promise((resolve, reject) => {
            wishListModel.aggregate([
            {
                $match: {
                    user: new ObjectId(userId),
                },
            },
            {
                $unwind: "$wishList",
            },
            {
                $project: {
                    productId: "$wishList.productId",
                    createdAt: "$wishList.createdAt",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "wishListed",
                },
            },
            {
                $project: {
                    productId: 1,
                    createdAt: 1,
                    wishListed: { $arrayElemAt: ["$wishListed", 0] },
                },
            },
            ]).then((wishListed) => {
                resolve(wishListed);
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

//add to wishList
const  addWishList = async(userId, proId) => {
    try {
        return new Promise((resolve, reject) => {
            wishListModel.findOne({ user: new ObjectId(userId) }).then(
            (userWishList) => {
                if (userWishList) {
                let productExist = userWishList.wishList.findIndex(
                    (wishList) => wishList.productId == proId
                );
                if (productExist != -1) {
                    resolve({ status: false });
                } else {
                    wishListModel.updateOne(
                    { user: new ObjectId(userId) },
                    {
                        $push: {
                        wishList: { productId: new ObjectId(proId) },
                        },
                    }
                    ).then(() => {
                    resolve({ status: true });
                    });
                }
                } else {
                let wishListData = {
                    user: new ObjectId(userId),
                    wishList: [{ productId: new ObjectId(proId) }],
                };
                let newWishList = new wishListModel(wishListData);
                newWishList
                    .save()
                    .then(() => {
                    resolve({ status: true });
                    })
                    .catch((err) => {
                    reject(err);
                    });
                }
            }
            );
        });
    } catch (error) {
        console.log(error.message);
    }
}

const removeProductWishlist = async (proId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            wishListModel.updateOne(
            { user: userId },
            {
                $pull: { wishList: { productId: proId } },
            }
            ).then((response) => {
            resolve(response);
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getWishListProducts,
    addWishList,
    removeProductWishlist
}