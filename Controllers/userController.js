const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");
// const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");

const userData = require("../Model/userModel");
const productData = require("../Model/productModel");
const cartData = require("../Model/cartModel");
const addressData = require("../Model/adderssModel");
const Category = require("../Model/categoryModel");
const Banner = require("../Model/bannerModel");

const otpHelper = require("../Helper/otpHelper");
const { default: mongoose } = require("mongoose");
// const { resolve } = require("path")
// const { response } = require("../app")
// const addressHelper = require("../Helper/addressHelper")
// const { request } = require("../Router/usersRouter")

//***************************************************************  HOME PAGE  *******************************************************//

module.exports.homePage = async (req, res) => {
  try {

    const category = await Category.find({ is_listed: true });
    const banner = await Banner.find({});
    const token = res.locals.user;

    const catId = await Category.aggregate([
    {
        $match: {
        is_listed: true,
        },
    },
    {
        $project: {
        _id: 1,
        },
    },
    ]);

    const product = await productData.find({
    category: { $in: catId },
    is_product_listed: true,
    });

    res.render("landing", {
    product: product,
    token: token,
    category: category,
    banners: banner,
    });
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//***************************************************************  PRODUCT PAGE  *******************************************************//

module.exports.productPage = async (req, res) => {
  try {
    const id = req.query.productId;
    const category = await Category.find({ is_listed: true });
    const token = res.locals.user;

      const product = await productData.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            is_product_listed: true,
          },
        },
        {
          $lookup: {
            from: 'categories', // Replace 'categories' with the actual name of the category collection
            localField: 'category', // Replace 'category_id' with the actual field in the product collection that represents the category ID
            foreignField: '_id',
            as: 'category',
          },
        },
      ]);
      const isListed = await productData.aggregate([
        {
          $match: {
            _id:  new mongoose.Types.ObjectId(id),
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $project: {
            category: 1,
            is_listed: "$category.is_listed"
          }
        }
        
      ])

      if(product.length===0 || category.length===0 || isListed[0].is_listed[0]===false){
        res.render('error-404')
      }else{
        res.render("product", {
          product: product,
          category: category,
          token: token,
        });

      }
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//***************************************************************  CART PAGE  *******************************************************//

//***************************************************************  Helper Functions  *******************************************************//

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "secret_key", { expiresIn: maxAge });
};

//****************************************************************  LOG_IN  *******************************************************//

//GET
module.exports.loginPage = async (req, res) => {
  try {
    if (res.locals.user != null) {
      redirect("/");
    } else {
      console.log("login page");
      res.render("login", { title: "LogIn" });
    }
  } catch (err) {
    console.log("login page error", err);
    res.render('block500')
  }
};

//POST
module.exports.loginVerify = async (req, res) => {
  try {
    console.log("/login-POST");
    // console.log(req.body.email);
    // console.log(req.body.password);
    const userDetails = await userData.findOne({ email: req.body.email });

    if (userDetails) {
      if (userDetails.password == req.body.password) {
        if (userDetails.is_blocked) {
          res.render("blocked");
        } else {
          //Create Token and Sending it as cookie
          const jwttoken = createToken(userDetails._id);
          res.cookie("jwt", jwttoken, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          console.log("token created");

          res.redirect("/");

          console.log("show landing page");
        }
      } else {
        res.render("login", { message: "password incorrect" });
      }
    } else {
      res.render("login", { message: "incorrect email Id" });
    }
  } catch (error) {
    res.render('block500')
  }
};

//**********************************************************  FORGOT PASSWORD  **************************************************************//

//GET FORGOT PASSWORD
module.exports.forgotPasswordNum = async (req, res) => {
  try{
    res.render("forgotPasswordNum");
    console.log("GET - forgotPasswordNum");

  }catch(error){
    res.render('block500')
  }
 
};

//POST FORGOT PASSWORD [NUM]
module.exports.forgotPasswordOtp = async (req, res) => {
  console.log("forget password");
  const user = await userData.findOne({ number: req.body.number });
  // console.log('',user);

  if (!user) {
    res.render("forgotPasswordNum", { message: "User Not Found" });
  } else {
    const OTP = otpHelper.generateOtp();
    await otpHelper.sendOtp(user.number, OTP);

    // req.session.number = number
    req.session.otp = OTP;
    req.session.email = user.email;
    req.session.number = user.number;

    // console.log("user email",req.session.email);
    //renderin page
    res.render("forgotPasswordOtp");
  }
};

//POST FORGOT PASSWORD [OTP]

module.exports.fpOtpVerify = async (req, res) => {
  try {
    const number = req.session.number;
    console.log("otp number", number);
    const otp = req.session.otp;
    console.log("session otp", otp);
    // res.send('welcome',)
    const reqOtp = req.body.otp;

    const otpHolder = await userData.findOne({ number: req.body.number });
    console.log("otp holder", otpHolder);
    if (otp == reqOtp) {
      //sending token as a cookie
      const token = createToken(userData._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.render("setNewPassword");
    } else {
      return console.log("Your OTP was Wrong");
    }
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

module.exports.setNewPasswordGet = async (req, res) => {
  res.render("setNewPassword");
};

//POST RESET-PASSWORD

module.exports.setNewPassword = async (req, res) => {
  try{
    const newpw = req.body.newpassword;
    const confpw = req.body.confpassword;
  
    if (!newpw || newpw.trim().length === 0) {
      return res.render("setNewPassword", { message: "Password is required" });
  }
   const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if(!passwordRegex.test(newpw)){
      return res.render("setNewPassword", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
  }
  if (!confpw || confpw.trim().length === 0) {
    return res.render("setNewPassword", { message: "Password is required" });
  }
  
  if(!passwordRegex.test(confpw)){
    return res.render("setNewPassword", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
  }
  
  if(newpw != confpw){
    return res.render("setNewPassword", { message: "Password does not match" });
  
  }
  
    if (newpw === confpw) {
   
    const email = res.locals.user.email;
  
      const updated = await userData.updateOne(
        { email: email },
        { $set: { password: newpw } }
      );
  
      res.redirect("/");
  
    }

  }catch(error){
    res.render('block500')
  }


};

//*********************************************************  SIGN_UP  ************************************************************//

//GET
module.exports.signupPage = async (req, res) => {
  res.render("signup", { title: "Signup" });
};

//POST
module.exports.signupAction = async (req, res) => {
  try{

    console.log("/signup-POST",req.body);
  const { fname, lname, email, password, number } = req.body;
  //storing user data in session
  const data = {
    fname,
    lname,
    email,
    password,
    number,
  };

  const existingUser = await userData.findOne({email:email})
    if (!req.body.fname || req.body.fname.trim().length === 0) {
        return res.render("signup", { message: "First Name is required" });
    }
    if (!req.body.lname || req.body.lname.trim().length === 0) {
        return res.render("signup", { message: "Last Name is required" });
    }
    if (!req.body.password || req.body.password.trim().length === 0) {
        return res.render("signup", { message: "Password is required" });
    }
    if (!req.body.email || req.body.email.trim().length === 0) {
        return res.render("signup", { message: "E-Mail is required" });
    }
    if (!req.body.number || req.body.number.trim().length === 0) {
        return res.render("signup", { message: "Phone Number is required" });
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        return res.render("signup", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("signup", { message: "Email Not Valid" });
    }
    if(existingUser){
      return res.render("signup",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("signup", { message: "Mobile Number should have 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.password)){
        return res.render("signup", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }




  req.session.userData = data;
//   console.log("data : \n", req.session.userData);

  const OTP = otpHelper.generateOtp();
  // await otpHelper.sendOtp(data.number,OTP)
  // console.log(OTP)

  req.session.otp = OTP;
  req.session.number = req.body.number;
  console.log("session otp", req.session.otp);
  console.log("session number", req.session.number);

  res.render('signupOtp', { countdown: 60 });

  }catch(error){
    res.render('block500')

  }
  

};

module.exports.signupOtp = async(req,res)=>{
    try{
        res.render('signupOtp', { countdown: 60 });

    }catch(error){
        console.log(error.message);
        res.render('block500')
    }
}


//OTP POST
module.exports.verifySignupOtp = async (req, res) => {
  try {
    const userOtp = req.body.otp;
    const newUser = req.session.userData;

    sessionOtp = req.session.otp;
    console.log("session otp on verify", req.session.otp);
    if (!sessionOtp || !newUser) {
      res.send("Invalid Session");
    } else if (sessionOtp !== userOtp) {
      res.send("Invalid OTP");
    } else {
      const user = new userData({
        fname: newUser.fname,
        lname: newUser.lname,
        email: newUser.email,
        password: newUser.password,
        number: newUser.number,
      });
      const userSave = await user.save();
      if (userSave) {
        //creating sending token as a cookie
        const jwttoken = createToken(user._id);
        res.cookie("jwt", jwttoken, { httpOnly: true, maxAge: maxAge * 1000 });

        res.redirect("/");
      } else {
        return console.log("Your OTP was Wrong");
      }
    }
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//*********************************************************  RESEND OTP  ************************************************************//

module.exports.resendLoginOtp = async (req, res) => {
  try{
    const OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(OTP);
  
    req.session.otp = OTP;
    res.render("forgotPasswordOtp");

  }catch(error){
    res.render('block500')
  }
 
};

module.exports.resendSignupOtp = async (req, res) => {
  const OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(OTP);

  req.session.otp = OTP;
  res.render("signupOtp");
};

//*********************************************************  LOG_OUT  ************************************************************//

module.exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  console.log("token destroyed");

  const product = await productData.find({});
  const token = req.session.token;
  res.redirect("/");
};

//*********************************************************  PROFILE  ************************************************************//

module.exports.profilePage = async (req, res) => {
  try {
    const user = res.locals.user;
    const token = res.locals.user;
    const category = await Category.find({ is_listed: true });

    res.render("profile", { user, category, token });
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//*********************************************************  EDIT_PROFILE  ************************************************************//

//GET
module.exports.editProfilePage = async (req, res) => {
  try {
    const user = res.locals.user;
    const userdata = await userData.findOne({ _id: user.id });
    console.log(userdata);
    res.render("editProfile", { userdata: userdata });
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//POST
module.exports.updateProfile = async (req, res) => {
  try {
    // console.log(req.body);
    const user = res.locals.user;
    const userdata = await userData.findOne({ _id: user.id });

    const data = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      number: req.body.number,
    };
    console.log('data',data);

    if (!req.body.fname || req.body.fname.trim().length === 0) {
        return res.render("editProfile",{ userdata: userdata , message: "First Name is required" });
    }
    if (!req.body.lname || req.body.lname.trim().length === 0) {
        return res.render("editProfile", { userdata: userdata , message: "Last Name is required" });
    }
   
    if (!req.body.email || req.body.email.trim().length === 0) {
        return res.render("editProfile", { userdata: userdata , message: "E-Mail is required" });
    }
    if (!req.body.number || req.body.number.trim().length === 0) {
        return res.render("editProfile",{ userdata: userdata , message: "Phone Number is required" });
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        return res.render("editProfile",{ userdata: userdata , message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("editProfile",{ userdata: userdata , message: "Email Not Valid" });
    }
    
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("editProfile",{ userdata: userdata , message: "Mobile Number should have 10 digit" });

    }
   

    const newData = await userData.updateOne(
      { _id: user.id },
      {
        $set: {
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          number: data.number,
        },
      }
    );
    // console.log(newData);

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//***************************************************************  ADDRESS  *******************************************************//

//***************************************************************  CHECKOUT PAGE  *******************************************************//

//GET
module.exports.checkoutPage = async (req, res) => {
  try {
    const token = res.locals.user;
    let subtotal = 0;
    // console.log('checkout page');
    const user = res.locals.user;

    const cart = await cartData.aggregate([
      {
        $match: {
          user_id: user.id,
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "products",
          localField: "product.product_id",
          foreignField: "_id",
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $project: {
          user_id: 1,
          itemId: "$items._id",
          itemName: "$items.name",
          itemPrice: { $multiply: ["$product.quantity", "$items.price"] },
          quantity: "$product.quantity",
        },
      },
    ]);

    const address = await addressData
      .aggregate([
        { $match: { user_data: user.id } },
        { $project: { _id: 0, address: 1 } },
        { $unwind: "$address" },
      ])
      .exec();

    try {
      if (cart && cart.length > 0) {
        subtotal = cart.reduce((acc, itemId) => acc + itemId.itemPrice, 0);
      } else {
        res.redirect("/cart");
        throw new Error("Cart is empty or invalid.");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }

    const category = await Category.find({ is_listed: true });
    if (address) {
      res.render("checkout", {
        cart,
        user,
        address,
        subtotal,
        category,
        token,
      });
    } else {
      res.render("checkout", {
        cart: cart,
        address: [],
        user: user,
        category,
        token,
        subtotal: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.render('block500')
  }
};

//***************************************************************  CATEGORY PAGE  *******************************************************//

//GET

module.exports.categoryPage = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const token = res.locals.user;

    const category = await Category.find({ is_listed: true });

    const products = await productData.aggregate([
        {
          $match: {
            category: new mongoose.Types.ObjectId(categoryId),
            is_product_listed: true,
          },
        },
    ]);
    const isListed = await productData.aggregate([
      {
        $match: {
          _id:  new mongoose.Types.ObjectId(id),
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $project: {
          category: 1,
          is_listed: "$category.is_listed"
        }
      }
      
    ])
    if(products.length===0 || category.length===0 || isListed[0].is_listed[0]===false){
      res.render('error-404')
    }else{
      res.render("category", { products, category, token });
    }
  } catch (err) {
    console.log("category page error", err);
    res.render('block500')
  }
};
