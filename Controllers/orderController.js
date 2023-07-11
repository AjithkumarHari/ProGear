const orderHelper = require('../Helper/orderHelper')
const couponHelper = require('../Helper/couponHelper')
// const moment = require("moment-timezone");
const Order = require('../Model/orderModel');
const Counpon = require('../Model/couponModel')

const Category = require('../Model/categoryModel');
const { response } = require('../app');
const mongoose = require('mongoose')


//POST
module.exports.checkout = async (req,res) =>{

    try {

        console.log('checkout post');
        const userId = res.locals.user
        const data = req.body

        await couponHelper.addCouponToUser(req.body.couponcode, userId);

        try{ 

            const response = await orderHelper.checktoutHelper(data,userId);
            
            console.log(response, "response");

            if (data.payment_method === "COD") {

                res.json({ orderStatus: true });
            }


            else if (data.payment_method === "wallet") {

                res.json({ orderStatus: true, message: "order placed successfully" });
            }


            else{
                if(data.payment_method === "RazorPay"){

                    const result = await orderHelper.getOrderIdHelper(userId.id)
                    // console.log("result",result);
                    const total= await orderHelper.findLastTotal(userId._id)
                    // console.log("total",total);

                    const order=await orderHelper.generateRazorpay(result.toString(),total)

                        res.json({ order:order});

                }

            }
        }catch (error) {
            console.log("got here ----");
            console.log({ error: error.message }, "22");
            res.json({ status: false, error: error.message });
        }
        
    } catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });

    }
 
}



//GET
module.exports.orderList = async (req,res) =>{

    try{
        const order = await orderHelper.getOrder(res.locals.user.id)    
        const token = res.locals.user

        const category = await Category.find({ })

        res.render('orders',{ order : order, category , token})

    }catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
  
}



//GET
module.exports.orderDetails = async (req,res) =>{ 

    try {
        const user = res.locals.user
        const token = res.locals.user
        const id = req.query.id
        const category = await Category.find({ })
        orderHelper.getOrderDetails(id, user._id).then((orders) => {
            const address = orders[0].orders.shippingAddress
            const products = orders[0].orders.productDetails 
            console.log('orders',orders);
          console.log('address',address);
          console.log('products',products);

          res.render('orderDetails',{
            orders,
            address,
            products,
            category,
            token
        })
        });  
    } catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}

module.exports.cancelOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId 
        const status = req.body.status
        // const user = res.locals.user.id
        console.log(orderId)
        orderHelper.cancelOrderHelper(orderId, status).then((response) => {
            console.log(response);
            res.send(response);
        });
            
    }
    catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}


module.exports.verifyRazorpayPayment = async (req, res) =>{
    try{
        // console.log("verifyRazorpayPayment",req.body);
        orderHelper.verifyRazorpayPaymentHelper(req.body).then( async ()=>{
            const orderId = req.body['order[receipt]']

            await Order.updateOne(
                {
                  "orders._id": new mongoose.Types.ObjectId(orderId)
                },
                {
                  $set: {
                    "orders.$.paymentStatus": "Success",
                    "orders.$.orderStatus": "Placed",
                    "orders.$.status":"Success",
                  }
                }
              );

            res.json({status:'Success'})

        }).catch(()=>{

            res.json({status:'Failed'})

        })

    }
    catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}


module.exports.verifyCoupon = (req, res) => {
    
    const couponCode = req.body.couponCode
    const userId = res.locals.user._id
    couponHelper.verifyCoupon(userId, couponCode).then((response) => {
        res.send(response)
    })
  }
  

module.exports.applyCoupon =  async (req, res) => {

    const couponCode = req.body.couponCode  
    const total = req.body.total
    console.log("totalhelper :"+total);
    couponHelper.applyCoupon(couponCode, total).then((response) => {
        res.send(response)
    })

  }