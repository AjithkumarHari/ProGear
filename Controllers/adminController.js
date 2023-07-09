const userData = require("../Model/userModel")
const adminData = require("../Model/adminModel")
const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")
const orderData = require('../Model/orderModel')

const path = require("path")
const jwt = require('jsonwebtoken')
// const moment = require("moment-timezone")
const mongoose = require('mongoose')

const adminHelper = require('../Helper/adminHelper')


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
  
    // console.log(email);
    // console.log(password)
  
    const data = await adminData.findOne({ });
  
    // console.log(data);
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
      const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
  
      const totalOrders = await orderData.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
      const totalPages = Math.ceil(count / limit);
      // console.log(totalPages);
  
      const skip = (page - 1) * limit;
  
      const order = await orderData.aggregate([
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      // console.log("order",order); 
  
      res.render("orderManagement", { order, 
        totalPages, page,limit 
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //--------------------------------------------ORDER DATA------------------------------------------------
//GET
module.exports.orderData = async (req,res) =>{ 

  try {
    console.log('orderData');
      const id = req.query.id
      console.log(id);

      adminHelper.getOrderData(id).then((orders) => {
        

        const address = orders[0].shippingAddress
        const products = orders[0].productDetails

        console.log("orders",orders);
        console.log("products",products);

 
        res.render('orderData',{orders, address,products})
      });    
  } catch (error) { 
      console.log(error);
      res.send({ success: false, error: error.message });
  }
}


//---------------------------------------------ORDER STATUS-----------------------------------



module.exports.changeStatus = async(req,res)=>{
  // console.log("haiii");
  let orderId = req.body.orderId
  let status = req.body.status
  console.log(orderId)
  adminHelper.changeOrderStatus(orderId, status).then((response) => {
    console.log(response);
    res.send(response);
  });

}


///order details slip

module.exports.orderDetails = async (req,res)=>{
    try {
      const id = req.query.id
      const user= res.locals.user.id
      console.log(id);
      adminHelper.findOrder(id,user).then((orders) => {
        const address = orders.shippingAddress
        const products = orders.productDetails 
        console.log('orders',orders);
        console.log('address',address);
        console.log('products',products);
        res.render('orderData',{orders,address ,products}) 
      });
      console.log(orders);
        
    } catch (error) {
      console.log(error.message);
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
  const  admin = req.session.admin;
  const report = await adminHelper.getSalesReport();
  const details = [];
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
    admin,
    details,
    getDate,
  });
}

module.exports.postSalesReport=async (req, res) => {
  const admin = req.session.admin;
  const details = [];
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