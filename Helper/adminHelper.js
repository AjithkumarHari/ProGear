const Order = require('../Model/orderModel')
const mongoose = require('mongoose')
const User = require('../Model/userModel');

const getOrderData  = (orderId) => {
    try {
      console.log("orderId",orderId);
        return new Promise(async (resolve, reject) => {
           const orders = await Order.aggregate([
            {
                $match: {
                "orders._id": new mongoose.Types.ObjectId(orderId),
                },
            },
            // { $unwind: "$orders" },

        ])
        console.log(orders,"orders")
            // .then((response) => {
                
            // let orders = response
            //     .filter((element) => {
            //     if (element.orders._id == orderId) {
                    
            //         return true;
            //     } 
            //     return false;
            //     })
            //     .map((element) => element.orders);
            //     console.log(orders,"orders")
            // resolve(orders);
            // });
           
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
                resolve(response);
              });
    
            }

          }
          else if(order.paymentMethod == 'wallet'){
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
  
          if (status == 'Cancelled' || status == 'Cancel Declined') {

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
        }else if(order.paymentMethod=='wallet'){

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

 module.exports =  {
    getOrderData,
    changeOrderStatus,
    returnOrderHelper,
    cancelOrderHelper

}