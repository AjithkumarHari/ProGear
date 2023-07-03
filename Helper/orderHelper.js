const mongoose = require('mongoose')
const Order = require('../Model/orderModel')
const Cart = require('../Model/cartModel')
const Address = require('../Model/adderssModel')



checktoutHelper =async (data, user)=>{
    try {
        return new Promise(async (resolve, reject) => {
            const productDetails = await Cart.aggregate([
              {
                $match: {
                    user_id: user._id.toString(),
                },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  item: "$product.product_id",
                  quantity: "$product.quantity",
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "item",
                  foreignField: "_id",
                  as: "productDetails",
                },
              },
              {
                $unwind: "$productDetails",
              }, {
                $project: {
                    productId: "$productDetails._id",
                    productName: "$productDetails.name",
                    productPrice: "$productDetails.price",
                    quantity: "$quantity",
                    category: "$productDetails.category",
                    image: "$productDetails.images",
                },
              },
            ]);
            // console.log("productDetails",productDetails);
            const addressData = await Address.aggregate([
                {
                    $match: { user_data: user._id.toString() },
                },
                {
                    $unwind: "$address",
                }
                ,
                {
                    $match: { "address._id": new mongoose.Types.ObjectId(data.address) },
                },
                {
                    $project: { item: "$address" },
                },
            ]);
            // console.log("addressData",addressData);
            let status,orderStatus
            if(data.payment_method == 'COD'){
                    (status = "Success"), (orderStatus = "Placed");
            }

            const orderData = {
                _id: new mongoose.Types.ObjectId(),
                name: addressData[0].item.name,
                paymentStatus: status,
                paymentMethod: data.payment_method,
                productDetails: productDetails,
                shippingAddress: addressData[0],
                orderStatus: orderStatus,
                totalPrice: data.total,
                createdAt:new Date()
            };
            // console.log(orderData)
            const order = await Order.findOne({ user:user._id  });
            if (order) {
                await Order.updateOne(
                    { user: user._id },
                    {
                        $push: { orders: orderData },
                    }
                ).then((response) => {
                    resolve(response);
                });
            } else {
                const newOrder = Order({
                    user: user._id,
                    orders: orderData,
                });
                await newOrder.save().then((response) => {
                    resolve(response);
                });
            }
            console.log('total',data.total);
            await Cart.deleteOne({ user_id:user._id }).then(() => {
                resolve();
            });

        });  
            
    } catch (error) { 
        console.log(error.message)

    }

}






getOrder = async (userId) => {
    try {
        console.log('get order helper');
  
        const order = await Order.findOne({ user: new mongoose.Types.ObjectId(userId) })

        return order
        
    }catch (error) {
        console.log(error);
        throw error;
    }

};



 
const getOrderDetails  = (orderId, userId) => {
    try {
      // console.log("userId",userId);
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $match: {
              "orders._id": new mongoose.Types.ObjectId(orderId),
              user: new mongoose.Types.ObjectId(userId),
            },
          },
          { $unwind: "$orders" },
        ]).then((response) => {
          let orders = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders);
  
          resolve(orders);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const cancelOrderHelper = async(orderId,status)=>{
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
  



module.exports={
    checktoutHelper,
    getOrder,
    getOrderDetails,
    cancelOrderHelper
}
