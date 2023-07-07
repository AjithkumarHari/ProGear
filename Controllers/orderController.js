const orderHelper = require('../Helper/orderHelper')
const moment = require("moment-timezone");
const Order = require('../Model/orderModel');

const Category = require('../Model/categoryModel');
const { response } = require('../app');
const mongoose = require('mongoose')


//POST
module.exports.checkout = async (req,res) =>{

    try {
        console.log('checkout post');
        const userId = res.locals.user
        const data = req.body

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
                    console.log("result",result);
                    const total= await orderHelper.findLastTotal(userId._id)
                    console.log("total",total);
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
        
        const orderDetails = order.orders

        orderHistory = orderDetails.map(history =>{
            let createdOnIST = moment(history.date)
            .tz('Asia/kolkata')
            .format('DD-MM-YYYY');

            return{...history, date:createdOnIST};
        })

        // const orders = order.orders
        // console.log('order : ',orderHistory);
        const category = await Category.find({ })

        res.render('orders',{ order : orderHistory, category , token:null})

    }catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }

}



//GET
module.exports.orderDetails = async (req,res) =>{ 

    try {
        const user = res.locals.user
        const id = req.query.id
        const category = await Category.find({ })
        // console.log(id);
        orderHelper.getOrderDetails(id, user._id).then((orders) => {
          const address = orders[0].shippingAddress
          const products = orders[0].productDetails
          
          orderDetails = orders.map(history =>{
            let createdOnIST = moment(history.date)
            .tz('Asia/kolkata')
            .format('DD-MM-YYYY h:mm A' );

            return{...history, date:createdOnIST};
        })
        //   console.log("orders user",orderDetails);

        //   console.log("products",products);
          


          res.render('orderDetails',{orderDetails,address,products, category, token:null})
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

// module.exports.returnOrder = async(req,res)=>{
//     const orderId = req.body.orderId
//     const status = req.body.status
//     const userId = req.body.userId
  
//     adminHelper.returnOrderHelper(orderId,userId,status).then((response) => {
//       res.send(response);
//     });
  
//   }

module.exports.verifyRazorpayPayment = async (req, res) =>{
    try{
        console.log("verifyRazorpayPayment",req.body);
        orderHelper.verifyRazorpayPaymentHelper(req.body).then( async ()=>{
            const orderId = req.body['order[receipt]']
            // console.log("orderId",orderId);
            await Order.updateOne(
                {
                  "orders._id": new mongoose.Types.ObjectId(orderId)
                },
                {
                  $set: {
                    "orders.$.orderStatus": "Placed",
                    "orders.$.status":"Success",
                  }
                }
              );
            console.log("payment succcessfull");



            console.log("res",response);
            res.json({status:true})

        })

    }
    catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}
