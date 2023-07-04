const { log } = require('handlebars/runtime');
const Order = require('../Model/orderModel')
const mongoose = require('mongoose')


const getOrderData  = (orderId, userId) => {
    try {
      console.log("userId",userId);
        return new Promise((resolve, reject) => {
            Order.aggregate([
            {
                $match: {
                "orders._id": new mongoose.Types.ObjectId(orderId),
                user: new mongoose.Types.ObjectId(userId),
                },
            },
            { $unwind: "$orders" },

           
        ])
            .then((response) => {
                
            let orders = response
                .filter((element) => {
                if (element.orders._id == orderId) {
                    
                    return true;
                }
                return false;
                })
                .map((element) => element.orders);
                console.log(orders,"orders")
            resolve(orders);
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
          console.log(response, "$$$$$$$$$$$$$$");
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
      }
    }


const returnOrder = (orderId, status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
  
          if (status == 'Return Declined') {
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                //   "orders.$.cancelStatus": status,
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
                //   "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then((response) => {
              resolve(response);
            });

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
    returnOrder

}