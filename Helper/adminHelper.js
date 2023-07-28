const Order = require('../Model/orderModel')
const mongoose = require('mongoose')
const User = require('../Model/userModel');
const Product = require('../Model/productModel') 

const findOrder  = (orderId) => {
  try {
    return new Promise(async(resolve, reject) => {

       await Order.aggregate([
        { $unwind: "$orders" },
        
        {
          $match: {
            "orders._id": new mongoose.Types.ObjectId(orderId)
       },
        },
         {
          $lookup: {
            from: "products",
            localField: "orders.productDetails.productId",
            foreignField: "_id",
            as: "productData"
          }
        },
        { $unwind: "$productData" },
        {
          $project: {
            _id: 0,
            user: 1,
            orders: 1,
            productData: "$productData.image",
          }
        }   

      ])
      
      .then((response) => {
        resolve(response); 
      });  
    });
  } catch (error) { 
    console.log(error.message);
    }
  }



const changeOrderStatus = (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new mongoose.Types.ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          // console.log(response, "$$$$$$$$$$$$$$");
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
      }
    }


const returnOrderHelper = (orderId,userId, status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
          
          // console.log("return order ",status);
          // console.log("paymey method",order.paymentMethod)
          if(order.paymentMethod == 'COD'){
            if (status == 'Return Declined') {
              Order.updateOne(
                { "orders._id": new mongoose.Types.ObjectId(orderId) },
                {
                  $set: {
                    "orders.$.orderStatus": status,
                    "orders.$.paymentStatus": "No Refund"
                  } 
                }
              ).then((response) => {
                resolve(response);
              });
            }else if(status == 'Return Accepted'){
              Order.updateOne(
                { "orders._id": new mongoose.Types.ObjectId(orderId) },
                {
                  $set: {
                    "orders.$.orderStatus": status,
                    "orders.$.paymentStatus": "Refund Credited to Wallet"
                  }
                }
              ).then(async (response) => {
                const user = await User.findOne({ _id: userId});
                user.wallet += parseInt(order.totalPrice);
                await user.save();
                const walletTransaction = {
                  date:new Date(),
                  type:"Credit",
                  amount:order.totalPrice,
                }
                const walletupdated = await User.updateOne(
                  { _id: user },
                  {
                    $push: { walletTransaction: walletTransaction },
                  }
                )
                resolve(response);
              });
            }
          }
          else if(order.paymentMethod == 'wallet' || order.paymentMethod == 'RazorPay'){
            if(status == 'Return Accepted'){
              Order.updateOne(
                { "orders._id": new mongoose.Types.ObjectId(orderId) },
                {
                  $set: {
                    "orders.$.orderStatus": status,
                    "orders.$.paymentStatus": "Refund Credited to Wallet"
                  }
                }
              ).then(async (response) => {
                const user = await User.findOne({ _id: userId});
                user.wallet += parseInt(order.totalPrice);
                await user.save();
                const walletTransaction = {
                  date:new Date(),
                  type:"Credit",
                  amount:order.totalPrice,
                }
                const walletupdated = await User.updateOne(
                  { _id: user },
                  {
                    $push: { walletTransaction: walletTransaction },
                  }
                 )
                resolve(response);
              });
    
            }else if(status == 'Return Declined'){
              Order.updateOne(
                { "orders._id": new mongoose.Types.ObjectId(orderId) },
                {
                  $set: {
                    "orders.$.orderStatus": status,
                    "orders.$.paymentStatus": "No Refund"
                  }
                }
              ).then((response) => {
                resolve(response);
              });
            }
          }
        });
      });
      
    } catch (error) {
      console.log(error.message);
    }
  };

  const cancelOrderHelper = (orderId,userId, status) => {
    try {

      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
          if(order.paymentMethod=='COD'){
  
          if (status == 'Cancel Declined') {

            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response);
            });
          }else if(status == 'Cancelled'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then(async(response) => {
              await addToStock(orderId,userId)
              resolve(response);
            });
            
  
          }
        }else if(order.paymentMethod=='wallet' || order.paymentMethod == 'RazorPay'){

          if(status == 'Cancelled'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              await addToStock(orderId,userId)
              const walletTransaction = {
                date:new Date(),
                type:"Credit",
                amount:order.totalPrice,
              }
              const walletupdated = await User.updateOne(
                { _id: user },
                {
                  $push: { walletTransaction: walletTransaction },
                }
               )
              resolve(response);
            });

          }else if(status == 'Cancel Declined'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response); 
            });
          }
        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };


const addToStock = async(orderId,userId)=>{
  
  Order.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then(async(orders) => {
    const order = orders.orders.find((order) => order._id == orderId);
    const cartProducts = order.productDetails
    for(const cartProduct of cartProducts ){
      const productId = cartProduct.productId;
      const quantity = cartProduct.quantity;
      const product = await Product.findOne({_id:productId})
      await Product.updateOne(
        {_id:productId},
        {$inc:{stock:quantity}}
      )
    }
  })
}

const getSalesReport = () => {
  try {
    return new Promise((resolve, reject)  => {
      Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.orderStatus": "Delivered",
          }, 
        },
      ])
      .then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

const postReport = (date) => {
  try {
    const start = new Date(date.startdate);
    const end = new Date(date.enddate);
    return new Promise((resolve, reject) => {
       Order.aggregate([
        {
          $unwind: "$orders",
        },
        { 
          $match: {
            $and: [
              { "orders.orderStatus": "Delivered" },
              {
                "orders.createdAt": {
                  $gte: start,
                  $lte: new Date(end.getTime() + 86400000),
                },
              },
            ],
          },
        },
      ])
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  } catch (error) {
    console.log(error.message);
  }
}

const getOnlineCount =  () => {
  return new Promise(async (resolve, reject) => {
    let response = await Order.aggregate([
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.paymentMethod": "RazorPay",
        },
      },
      {
        $group:{
          _id: null,
        totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
        count: { $sum: 1 }
        }
      }
    ]);
    resolve(response);
  });
}

const updateProductHelper=async(texts, Image) => {
  return new Promise(async (resolve, reject) => {
       const id = texts.id
       console.log('updateProductHelper',id);
      let response = await Product.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: {
            name : texts.name ,
            description : texts.des,
            brand : texts.brand, 
            image : Image , 
            price : texts.price,
            stock : texts.stock
          },
        }
      );
      resolve(response);
    });
}



const getWalletCount =  () => {
  return new Promise(async (resolve, reject) => {
    const response = await Order.aggregate([
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.paymentMethod": "wallet",
          "orders.orderStatus": "Delivered" 

        },
      },
      {
        $group:{
          _id: null,
        totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
        count: { $sum: 1 }

        }

      }

    ]);
    resolve(response);
  });
}

const getCodCount =  () => {
  return new Promise(async (resolve, reject) => {
    const response = await Order.aggregate([
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.paymentMethod": "COD",
          "orders.orderStatus": "Delivered" 

        },
      },
      {
        $group:{
          _id: null,
        totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
        count: { $sum: 1 }

        }

      }

    ]);
    resolve(response);
  });
}
module.exports =  {

    changeOrderStatus,
    returnOrderHelper,
    cancelOrderHelper,
    findOrder,
    getSalesReport,
    postReport,
    getOnlineCount,
    updateProductHelper,
    getWalletCount,
    getCodCount

}