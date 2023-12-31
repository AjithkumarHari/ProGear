const mongoose = require('mongoose')
const Order = require('../Model/orderModel')
const Cart = require('../Model/cartModel')
const Address = require('../Model/adderssModel')
const User = require('../Model/userModel')
const Product = require('../Model/productModel')

const Razorpay = require('razorpay')

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
            else if (data.payment_method === "wallet") {
                const userData = await User.findById({ _id:user._id });
                if (userData.wallet < data.total) {
                  flag = 1;
                  reject(new Error("Insufficient wallet balance!"));
                  return 
                } else {
                  userData.wallet -= data.total;
      
                  await userData.save()
                  const walletTransaction = {
                    date:new Date(),
                    type:"Debit",
                    message:"Payment for Placing Order",
                    amount:data.total,

                  }
                  const walletupdated = await User.updateOne(
                    { _id: user },
                    {
                      $push: { walletTransaction: walletTransaction },
                    }
                  )
                  .then(() => {
                  (status = "Success"), (orderStatus = "Placed");
                });
                }
              }
            else if(data.payment_method == 'RazorPay'){
                    (status = "Failed"), (orderStatus = "Pending");
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
            // console.log('total',data.total);
           
                resolve();


        });  
    } catch (error) { 
        console.log(error.message)
    }
}


const updateStock = async(userId)=>{
  try{
    const products = await Cart.findOne({user_id:userId})
    const cartProducts = products.product
    for(const cartProduct of cartProducts ){
      const productId = cartProduct.product_id;
      const quantity = cartProduct.quantity;
      const product = await Product.findOne({_id:productId})
      if(product.stock < cartProduct.quantity ){
        return false
      }
      await Product.updateOne({_id:productId},
        {$inc:{stock:-quantity}}
        )
    }
    return true
  }catch(error){
    console.log('Error from updateStock',error);
  }
}
  
  
const checkStock = async(userId)=>{
  try{
    const products = await Cart.findOne({user_id:userId})
  const cartProducts = products.product
  for(const cartProduct of cartProducts ){
    const productId = cartProduct.product_id;
    const product = await Product.findOne({_id:productId})
    if(product.stock < cartProduct.quantity ){
      return false
    }
  }
  return true
  }catch(error){
    console.log('Error from checkStock',error);
  }
}

const getOrder = async (userId) => {
    try {
      const order = await Order.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
          }
        },
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
        {
          $match: { "orders.paymentStatus": { $ne: "Failed" } }
        }
      ]);
        return order
    }catch (error) {
        console.log(error);
        throw error;
    }
};

const getOrderDetails  = (orderId, userId) => {
    try {
      return new Promise(async(resolve, reject) => {
          await Order.aggregate([
            {
              $unwind: "$orders"
            },
            {
              $match: {
                "orders._id": new mongoose.Types.ObjectId(orderId)
              }
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

  const cancelOrderHelper = async(orderId,status)=>{
    try {
      return new Promise((resolve, reject) => {

        Order.updateOne(
          { "orders._id": new mongoose.Types.ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {

          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  

  const getOrderIdHelper= async(user) =>{
    try{


      const result = await Order.aggregate([
        {
          $match: {
            "user": new mongoose.Types.ObjectId(user)
          }
        },
        {
          $project: {
            lastOrder: {
              $arrayElemAt: [
                "$orders",
                -1
              ]
            }
          }
        },
        {
          $project: {
            lastOrderId: "$lastOrder._id"
          }
        }  
      ])


    return result[0].lastOrderId

    }catch (error) {
      console.log(error.message);
    }

  }

  



  const generateRazorpay = async(orderId,total)=>{
    try{
      return new Promise((resolve,reject)=>{
        var options = {
          amount: total*100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderId
        };
        instance.orders.create(options, function(err, order) {

          if (err) {
            console.log('Order Creation Error from Razorpay: ' + err);
        } else {
          resolve(order)
        }
          
        });
      })


    }catch (error) {
      console.log(error.message);
    }

  }

///findLastOredrTotal

const findLastTotal=async(user)=>{
  try {
  
    // console.log("haiii");
    const total=await Order.aggregate([
      { $match: { "user": new Object(user) } },
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
      { $limit: 1 },
      { $project: { _id: 0, totalPrice: "$orders.totalPrice" } }
    ])
  
    // console.log(total);
     return total[0].totalPrice
    
  } catch (error) {
    console.log(error.message);
  }
}


const verifyRazorpayPaymentHelper = async(details) =>{
  try{
    return new Promise ((resolve,reject)=>{
      console.log('details',details);
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);

      hmac = hmac.digest('hex')
      // console.log(hmac);
      if(hmac == details['payment[razorpay_signature]']){
        resolve()
      }
      else{
        reject()
      }
    })

  }catch (error) {
    console.log(error.message); 
  }
}
module.exports={
    checktoutHelper,
    getOrder,
    getOrderDetails,
    cancelOrderHelper,
    getOrderIdHelper,
    generateRazorpay,
    findLastTotal,
    verifyRazorpayPaymentHelper,
    updateStock,
    checkStock
    // returnOrderHelper
    
}
