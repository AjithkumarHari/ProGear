const userData = require("../Model/userModel")
const adminData = require("../Model/adminModel")
const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")
const orderData = require('../Model/orderModel')

// const path = require("path")
const jwt = require('jsonwebtoken')
// const moment = require("moment-timezone")
// const mongoose = require('mongoose')

const adminHelper = require('../Helper/adminHelper')


const maxAge = 3* 24* 60 * 60

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_ADMIN_SECRET_KEY, { expiresIn : maxAge })
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
  
    const data = await adminData.findOne({ });
  
    if (data) {
      if (data.password === password) {
          
        //Create Token and Sending it as cookie
        const token = createToken(data._id)
        res.cookie('jwtAdmin',token, {httpOnly: true, maxAge : maxAge*1000 })

        res.redirect('/admin/landing')
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
        const find = await userData.find({ })
        res.render('userManagement', { find: find })
    } catch (error) {
        res.send("error")
        console.log(error.message);
    }
}




//8888888888888888888888888888888888888888888888888888---BLOCK/UNBLOCK USER--8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888

module.exports.changeUserStatus = async (req, res) => {

    try {

      const id = req.body.userId;
  
      const userdata = await userData.findOne({ _id: id });

      if (userdata) {
        // Toggle the value of is_blocked
        const newStatus = !userdata.is_blocked; 
         
        result = await userData.updateOne({ _id: id }, { $set: { is_blocked: newStatus } });
        
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
  try{
    res.cookie('jwtAdmin', '' ,{maxAge : 1})

  res.redirect('/admin')

  }catch(error){
    console.log(error.message);
      res.send({ success: false, error: error.message });

  }
  
}



//Get
module.exports.orderManagement = async( req,res ) =>{

    try {
      const page = parseInt(req.query.page) || 1; // Current page number, default is 1
      const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
  
      const totalOrders = await orderData.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
      const totalPages = Math.ceil(count / limit);
  
      const skip = (page - 1) * limit;
  
      const order = await orderData.aggregate([
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
  
      res.render("orderManagement", { order, 
        totalPages, page,limit 
      });
    } catch (error) {
      console.log(error.message);
    }
  };

//---------------------------------------------ORDER STATUS-----------------------------------

module.exports.changeStatus = async(req,res)=>{

  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.changeOrderStatus(orderId, status).then((response) => {

    res.send(response);
  });

}


///order details slip

module.exports.orderDetails = async (req,res)=>{
  try {
    const id = req.query.id
    adminHelper.findOrder(id).then(async(orders) => {
      const address = orders[0].orders.shippingAddress
      const products = orders[0].orders.productDetails 
      res.render('orderData',{orders,address ,products,productData}) 
    });
  } catch (error) {
    console.log("Error from orderDetails",error.message);
  }
}


module.exports.cancelOrder = async(req,res)=>{
  const userId = res.locals.user.id
  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.cancelOrderHelper(orderId,userId,status).then((response) => {
    res.send(response);
  });

}

module.exports.returnOrder = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status
  const userId = res.locals.user.id
  // console.log("userId",userId);
  adminHelper.returnOrderHelper(orderId,userId,status).then((response) => {
    res.send(response);
  });

}




// get sales report page
module.exports.getSalesReport=async (req, res) => {

  const report = await adminHelper.getSalesReport();
  let details = [];
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  report.forEach((orders) => {
    details.push(orders.orders);
  });

// console.log('details',details);

  res.render("salesReport", {
    details,
    getDate,
  });
}

module.exports.postSalesReport=async (req, res) => {
  const admin = req.session.admin;
  let details = [];
  const getDate = (date) => {
    const orderDate = new Date(date);
    const day = orderDate.getDate();
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
      isNaN(year) ? "0000" : year
    }`;
  };

  adminHelper.postReport(req.body).then((orderData) => {
    // console.log(orderData, "orderData");
    orderData.forEach((orders) => {
      details.push(orders.orders);
    });
    // console.log(details, "details");
    res.render("salesReport", {
      admin,
      details,
      getDate,
    });
    });
  }


module.exports.loadDashboard = async(req,res)=>{
  try {
    const orders = await orderData.aggregate([
      { $unwind: "$orders" },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 }
        }
      }

    ])

    const salesData = await orderData.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered"  // Consider only completed orders
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {  // Group by the date part of createdAt field
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          dailySales: { $sum: { $toDouble: "$orders.totalPrice" } }  // Calculate the daily sales
        }
      },
      {
        $sort: {
          _id: 1  // Sort the results by date in ascending order
        }
      }
    ])

    const salesCount = await orderData.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.orderStatus": "Delivered"  // Consider only completed orders
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {  // Group by the date part of createdAt field
              format: "%Y-%m-%d",
              date: "$orders.createdAt"
            }
          },
          orderCount: { $sum: 1 }  // Calculate the count of orders per date
        }
      },
      {
        $sort: {
          _id: 1  // Sort the results by date in ascending order
        }
      }
    ])



    const categoryCount  = await categoryData.find({}).count()

    const productsCount  = await productData.find({}).count()
    const onlinePay = await adminHelper.getOnlineCount()

    const latestorders = await orderData.aggregate([
      {$unwind:"$orders"},
      {$sort:{
        'orders.createdAt' :-1
      }},
      {$limit:10}
    ]) 

      res.render('adminDashboard'
      ,{
        orders,
        productsCount,
        categoryCount,
        onlinePay,
        salesData,
        order:latestorders,
        salesCount
      }
      )
  } catch (error) {
      console.log(error)
  }
}