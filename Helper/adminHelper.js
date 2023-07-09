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


const findOrder  = (orderId,user) => {
  try {
    console.log('orderId',orderId);
    console.log('user',user);
    return new Promise(async(resolve, reject) => {
      const orderId = "64a80da28b127146d01c3f66"; // Replace with the desired orderId

      const result =
       await Order.aggregate([
        {
          $match: {
            "orders._id": new mongoose.Types.ObjectId(orderId)
          }
        },
        // {
        //   $unwind: "$orders"
        // },
        // {
        //   $match: {
        //     "orders._id": new mongoose.Types.ObjectId(orderId)
        //   }
        // },
        // {
        //   $project: {
        //     "orders":1
        //   }
        // }
      ])
      
      console.log('result', result);
      
      // .then((response) => {
      //   console.log('response',response);
      //   let orders = response
      //     .filter((element) => {
      //       if (element.orders._id == orderId) {
      //         return true;
      //       }
      //       return false;
      //     })
      //     .map((element) => element.orders);

      //   resolve(orders);
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


const getSalesReport= () => {
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
      ]).then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

const postReport = (date) => {
  console.log(date, "date+++++");
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
          // console.log(response, "response---");
          resolve(response);
        });
    });
  } catch (error) {
    console.log(error.message);
    }
  }


 module.exports =  {
    getOrderData,
    changeOrderStatus,
    returnOrderHelper,
    cancelOrderHelper,
    findOrder,
    getSalesReport,
    postReport

}