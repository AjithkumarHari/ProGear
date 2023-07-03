const orderHelper = require('../Helper/orderHelper')
const moment = require("moment-timezone");
const Order = require('../Model/orderModel');
const Category = require('../Model/categoryModel')


//POST
module.exports.checkout = async (req,res) =>{

    try {
        console.log('checkout post');
        const userId = res.locals.user
        const data = req.body

        try{

            const response = await orderHelper.checktoutHelper(data,userId);
            
            console.log(response, "response");

            res.send('Order Placed')

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
          console.log("orders user",orderDetails);

          console.log("products",products);
          


          res.render('orderDetails',{orderDetails,address,products, category, token:null})
        });  
    } catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}

// module.exports.cancelOrder = async (req, res) =>{
//     try{
//         const orderId = req.body.orderId
//         const status = req.body.status
      
//         adminHelper.cancelOrder(orderId,status).then((response) => {
//           res.send(response);
//         });
      

//     } catch (error) {
//         console.log(error);
//         res.send({ success: false, error: error.message });
//     }

// }
module.exports.cancelOrder = async(req,res)=>{
    const orderId = req.body.orderId 
    const status = req.body.status
    console.log(orderId)
    orderHelper.cancelOrderHelper(orderId, status).then((response) => {
      console.log(response);
      res.send(response);
    });
}