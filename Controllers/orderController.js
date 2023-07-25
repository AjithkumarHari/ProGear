const orderHelper = require('../Helper/orderHelper')
const couponHelper = require('../Helper/couponHelper')
const Order = require('../Model/orderModel');
const Category = require('../Model/categoryModel');
const Cart = require('../Model/cartModel')
const mongoose = require('mongoose')

//POST
module.exports.checkout = async (req,res) =>{
    try {
        const userId = res.locals.user
        const data = req.body
        await orderHelper.checktoutHelper(data,userId);
        await couponHelper.addCouponToUser(req.body.couponcode, userId);
        try{ 
           
            if (data.payment_method === "COD") {
                res.json({ orderStatus: true });
            }
            else if (data.payment_method === "wallet") {
                res.json({ orderStatus: true, message: "order placed successfully" });
            }
            else{
                if(data.payment_method === "RazorPay"){
                    const result = await orderHelper.getOrderIdHelper(userId.id)
                    const total= await orderHelper.findLastTotal(userId._id)
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
        console.log("Error from checkout", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.orderList = async (req,res) =>{
    try{
        const order = await orderHelper.getOrder(res.locals.user.id)    
        const token = res.locals.user
        const category = await Category.find({ is_listed: true });
        res.render('orders',{ order : order, category , token})
    }catch(error){
        console.log("Error from orderList", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.orderDetails = async (req,res) =>{ 
    try {
        const user = res.locals.user
        const token = res.locals.user
        const id = req.query.id
        const category = await Category.find({ is_listed: true });
        orderHelper.getOrderDetails(id, user._id).then((orders) => {
            const address = orders[0].orders.shippingAddress
            const products = orders[0].orders.productDetails 
            res.render('orderDetails',{
                orders,
                address,
                products,
                category,
                token
            })
        });  
    } catch (error) {
        console.log("Error from orderDetails", error);
        res.redirect("/error-500");
    }
}

module.exports.cancelOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId 
        const status = req.body.status
        orderHelper.cancelOrderHelper(orderId, status).then((response) => {
            res.send(response);
        }); 
    }
    catch (error) {
        console.log("Error from cancelOrder", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.verifyRazorpayPayment = async (req, res) =>{
    try{
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
            await Cart.deleteOne({ user_id:res.locals.user.id }).then(() => {
                
            res.json({status:'Success'})
        })
        }).catch(()=>{
            res.json({status:'Failed'})
        })
    }
    catch (error) {
        console.log("Error from verifyRazorpayPayment", error);
        res.redirect("/error-500");
    }
}

module.exports.verifyCoupon = (req, res) => {
    try{
        const couponCode = req.body.couponCode
        const userId = res.locals.user._id
        couponHelper.verifyCoupon(userId, couponCode).then((response) => {
            res.send(response)
        })
    }catch (error) {
        console.log("Error from verifyCoupon", error);
        res.redirect("/error-500");
    }
}
  
module.exports.applyCoupon =  async (req, res) => {
    try{
        const couponCode = req.body.couponCode  
        const total = req.body.total
        couponHelper.applyCoupon(couponCode, total).then((response) => {
            res.send(response)
        })
    }catch (error) {
        console.log("Error from applyCoupon", error);
        res.redirect("/error-500");
    }
}