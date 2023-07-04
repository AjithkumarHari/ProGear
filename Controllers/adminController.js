const userData = require("../Model/userModel")
const adminData = require("../Model/adminModel")
const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")
const orderData = require('../Model/orderModel')

const path = require("path")
const jwt = require('jsonwebtoken')
const moment = require("moment-timezone")
const mongoose = require('mongoose')



const adminHelper = require('../Helper/adminHelper')
const { log } = require("console")


const maxAge = 3* 24* 60 * 60

const createToken = (id) => {
    return jwt.sign({id}, 'secret_key_admin', { expiresIn : maxAge })
}

module.exports.adminDashboard = async (req ,res) => {
    res.render('adminDashboard')
}


//8888888888888888888888888888888888888888888888888--ADMINLOGIN--888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888


//GET
module.exports.adminLogin = async (req, res) =>{
  try {
    res.render('adminLogin',{ title : 'LogIn'})
  } catch (error) {
    res.send("error")
    console.log(error.message);
  }
}

//POST
module.exports.verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
  
    console.log(email);
    console.log(password)
  
    const data = await adminData.findOne({ });
  
    console.log(data);
    console.log(data.password);
    if (data) {
      if (data.password === password) {
          
        //Create Token and Sending it as cookie
        const token = createToken(data._id)
        res.cookie('jwtAdmin',token, {httpOnly: true, maxAge : maxAge*1000 })
        console.log('Admin token created');

        res.redirect('/admin/user')
      }
    }
  } 
  catch (error) {
    console.log(error.message);
  }
};
  
//8888888888888888888888888888888888888888888888888--USER MANAGEMENT--888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888


module.exports.userManagement = async (req ,res) => {
    try {
        const find = await userData.find({})
        res.render('userManagement', { defaultLayout: null, find: find })
        console.log("user managment loaded")
    } catch (error) {
        res.send("error")
        console.log(error.message);
    }
}




//8888888888888888888888888888888888888888888888888888---BLOCK/UNBLOCK USER--8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888

module.exports.changeStatus = async (req, res) => {
    try {
      const id = req.query.userid;
      console.log('id',id);
      const userdata = await userData.findOne({ _id: id });
      console.log('userdata',userdata);
  
      if (userdata) {
        // Toggle the value of is_blocked
        const newStatus = !userdata.is_blocked; 
        console.log('ns',newStatus);
         
        result = await userData.updateOne({ _id: id }, { $set: { is_blocked: newStatus } });
        console.log(result);
        res.redirect('/admin/user');
  
        // res.send({ success: true, is_blocked: newStatus }); // Sending the updated status as the response
      } else {
        res.redirect('/admin/user');
      }
    } catch (error) {
      console.log(error.message);
      res.send({ success: false, error: error.message });
    }
  };


//888888888888888888888888888888888888888888888888--ADMIN LOGOUT---8888888888888888888888888888888888888888888888888888888888888888888888

module.exports.logout = (req,res) =>{
  res.cookie('jwtAdmin', '' ,{maxAge : 1})
  console.log("Admin token destroyed");
  res.redirect('/admin')
}



//Get
module.exports.orderManagement = async( req,res ) =>{

    try {
      const page = parseInt(req.query.page) || 1; // Current page number, default is 1
      const limit = parseInt(req.query.limit) || 5; // Number of items per page, default is 10
  
      const totalOrders = await orderData.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
      const totalPages = Math.ceil(count / limit);
      console.log(totalPages);
  
      const skip = (page - 1) * limit;
  
      const order = await orderData.aggregate([
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      console.log("order",order); 
  
      res.render("orderManagement", { order, 
        totalPages, page,limit 
      });
    } catch (error) {
      console.log(error.message);
    }
  };

//GET
module.exports.orderData = async (req,res) =>{ 

  try {
      const user = res.locals.user.id
      const id = req.query.id
      console.log(id);

      const order = await orderData.aggregate([
        {
            $match: {
            "orders._id": new mongoose.Types.ObjectId(id),
            user: new mongoose.Types.ObjectId(user),
            },
        },
        { $unwind: "$orders" },
      ])

      console.log("order",order);

      adminHelper.getOrderData(id, user).then((orders) => {
        

        const address = orders[0].shippingAddress
        const products = orders[0].productDetails

        
        orderDetails = orders.map(history =>{
          let createdOnIST = moment(history.date)
          .tz('Asia/kolkata')
          .format('DD-MM-YYYY h:mm A' );   

          return{...history, date:createdOnIST};
      })
        console.log("orderdata",orderDetails);
        // console.log("products",products);


        res.render('orderData',{orderDetails, address,products})
      });    
  } catch (error) { 
      console.log(error);
      res.send({ success: false, error: error.message });
  }
}


//---------------------------------------------ORDER STATUS-----------------------------------



module.exports.changeStatus = async(req,res)=>{
  console.log("haiii");
  let orderId = req.body.orderId
  let status = req.body.status
  console.log(orderId)
  adminHelper.changeOrderStatus(orderId, status).then((response) => {
    console.log(response);
    res.send(response);
  });

}

// const cancelOrder = async(req,res)=>{
//   let orderId = req.body.orderId
//   let status = req.body.status

//   adminHelper.cancelOrder(orderId,status).then((response) => {
//     res.send(response);
//  });

// }

module.exports.cancelOrder = (req,res) => {
  try {
    console.log('cancel order');
    const orderId=req.body.orderId
    const status=req.body.status
    return new Promise(async (resolve, reject) => {
      orderData.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then((orders) => {
        const order = orders.orders.find((order) => order._id == orderId);

        if (status == 'Cancelled' || status == 'Cancel Declined'  || status == 'Cancel') {
          orderData.updateOne(
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
      });
    });
  } catch (error) {
    console.log(error.message);
    }
  };


///order details slip

module.exports.orderDetails = async (req,res)=>{
    try {
      const id = req.query.id
      console.log(id);
      adminHelper.findOrder(id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('orderSlip',{orders,address,products}) 
      });
      console.log(orders);
        
    } catch (error) {
      console.log(error.message);
    }
  
  }

module.exports.returnOrder = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.returnOrder(orderId,status).then((response) => {
    res.send(response);
  });

}