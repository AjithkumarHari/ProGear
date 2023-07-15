const bcrypt = require("bcrypt");
const _ = require("lodash");
// const axios = require("axios");
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
const mongoose = require("mongoose");

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
    console.log('Error from homePage',error);
    res.redirect("/error-500");
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
          from: "categories",  
          localField: "category", 
          foreignField: "_id",
          as: "category",
        },
      },
    ]);
    const isListed = await productData.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          category: 1,
          is_listed: "$category.is_listed",
        },
      },
    ]);

    if (
      product.length === 0 ||
      category.length === 0 ||
      isListed[0].is_listed[0] === false
    ) {
      res.redirect("/error-404");
    } else {
      res.render("product", {
        product: product,
        category: category,
        token: token,
      });
    }
  } catch (error) {
    console.log('Error from productPage',error);
    res.redirect("/error-500");
  }
};

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
      res.render("login", { title: "LogIn" });
    }
  } catch (err) {
    console.log("login page error", err);
    res.redirect("/error-500");

  }
};

//POST
module.exports.loginVerify = async (req, res) => {
  try {
    const userDetails = await userData.findOne({ email: req.body.email });
    if (userDetails) {
      if (userDetails.password == req.body.password) {
        if (userDetails.is_blocked) {
          res.redirect('/error-403')
        } else {
          const jwttoken = createToken(userDetails._id);
          res.cookie("jwt", jwttoken, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          res.redirect("/");
        }
      } else {
        res.render("login", { message: "password incorrect" });
      }
    } else {
      res.render("login", { message: "incorrect email Id" });
    }
  } catch (error) {
    console.log("Error in loginVerify" , error);
    res.redirect("/error-500");
  }
};

//**********************************************************  FORGOT PASSWORD  **************************************************************//

//GET FORGOT PASSWORD
module.exports.forgotPasswordNum = async (req, res) => {
  try {
    res.render("forgotPasswordNum");
  } catch (error) {
    console.log("Error in forgotPasswordNum" , error);
    res.redirect("/error-500");

  }
};

//POST FORGOT PASSWORD [NUM]
module.exports.forgotPasswordOtp = async (req, res) => {
  try{
    const user = await userData.findOne({ number: req.body.number });
    if (!user) {
      res.render("forgotPasswordNum", { message: "User Not Found" });
    } else {
      const OTP = otpHelper.generateOtp();
      await otpHelper.sendOtp(user.number, OTP);
      req.session.otp = OTP;
      req.session.email = user.email;
      req.session.number = user.number;
      res.render("forgotPasswordOtp");
    }
  }catch (error) {
    console.log("Error in forgotPasswordOtp" , error);
    res.redirect("/error-500");
  }
};

//POST FORGOT PASSWORD [OTP]
module.exports.fpOtpVerify = async (req, res) => {
  try {
    const otp = req.session.otp;
    const reqOtp = req.body.otp;
    if (otp == reqOtp) {
      const token = createToken(userData._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.render("setNewPassword");
    } else {
      return console.log("Your OTP was Wrong");
    }
  } catch (error) {
    console.log("Error in fpOtpVerify" ,error);
    res.redirect("/error-500");
  }
};


module.exports.setNewPasswordGet = async (req, res) => {
  try {
    res.render("setNewPassword");
  } catch (error) {
    console.log("Error in setNewPasswordGet" , error);
    res.redirect("/error-500");
  }
};

//POST RESET-PASSWORD
module.exports.setNewPassword = async (req, res) => {
  try {
    const newpw = req.body.newpassword;
    const confpw = req.body.confpassword;

    if (!newpw || newpw.trim().length === 0) {
      return res.render("setNewPassword", { message: "Password is required" });
    }
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newpw)) {
      return res.render("setNewPassword", {
        message:
          "Password Should Contain atleast 8 characters,one number and a special character",
      });
    }
    if (!confpw || confpw.trim().length === 0) {
      return res.render("setNewPassword", { message: "Password is required" });
    }

    if (!passwordRegex.test(confpw)) {
      return res.render("setNewPassword", {
        message:
          "Password Should Contain atleast 8 characters,one number and a special character",
      });
    }

    if (newpw != confpw) {
      return res.render("setNewPassword", {
        message: "Password does not match",
      });
    }

    if (newpw === confpw) {
      const email = res.locals.user.email;

      const updated = await userData.updateOne(
        { email: email },
        { $set: { password: newpw } }
      );

      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/error-500");

  }
};

//*********************************************************  SIGN_UP  ************************************************************//

//GET
module.exports.signupPage = async (req, res) => {
  res.render("signup", { title: "Signup" });
};

//POST
module.exports.signupAction = async (req, res) => {
  try {
    const { fname, lname, email, password, number } = req.body;
    //storing user data in session
    const data = {
      fname,
      lname,
      email,
      password,
      number,
    };

    const existingUser = await userData.findOne({ email: email });
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    const mobileNumberRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!req.body.fname || req.body.fname.trim().length === 0) {
      return res.render("signup", { message: "First Name is required" });
    } else if (!req.body.lname || req.body.lname.trim().length === 0) {
      return res.render("signup", { message: "Last Name is required" });
    } else if (!req.body.password || req.body.password.trim().length === 0) {
      return res.render("signup", { message: "Password is required" });
    } else if (!req.body.email || req.body.email.trim().length === 0) {
      return res.render("signup", { message: "E-Mail is required" });
    } else if (!req.body.number || req.body.number.trim().length === 0) {
      return res.render("signup", { message: "Phone Number is required" });
    } else if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
      return res.render("signup", {
        message: "Name should not contain numbers",
      });
    } else if (!emailRegex.test(email)) {
      return res.render("signup", { message: "Email Not Valid" });
    } else if (existingUser) {
      return res.render("signup", { message: "Email already exists" });
    } else if (!mobileNumberRegex.test(number)) {
      return res.render("signup", {
        message: "Mobile Number should have 10 digit",
      });
    } else if (!passwordRegex.test(req.body.password)) {
      return res.render("signup", {
        message:
          "Password Should Contain atleast 8 characters,one number and a special character",
      });
    } else {
      req.session.userData = data;
      //   console.log("data : \n", req.session.userData);

      const OTP = otpHelper.generateOtp();
      // await otpHelper.sendOtp(data.number,OTP)
      // console.log(OTP)

      req.session.otp = OTP;
      req.session.number = req.body.number;
      console.log("session otp", req.session.otp);
      console.log("session number", req.session.number);

      res.render("signupOtp", { countdown: 60 });
    }
  } catch (error) {
    res.redirect("/error-500");

    console.log(error);
  }
};

module.exports.signupOtp = async (req, res) => {
  try {
    res.render("signupOtp", { countdown: 60 });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error-500");

  }
};

//OTP POST
module.exports.verifySignupOtp = async (req, res) => {
  try {
    const userOtp = req.body.otp;
    const newUser = req.session.userData;

    sessionOtp = req.session.otp;
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
    res.redirect("/error-500");

  }
};

//*********************************************************  RESEND OTP  ************************************************************//

module.exports.resendLoginOtp = async (req, res) => {
  try {
    const OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(OTP);
    req.session.otp = OTP;
    res.render("forgotPasswordOtp");
  } catch (error) {
    console.log("Error in resendLoginOtp" ,error);
    res.redirect("/error-500");

  }
};

module.exports.resendSignupOtp = async (req, res) => {
  try{
    const OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(OTP);
  
    req.session.otp = OTP;
    res.render("signupOtp");

  }catch(error){
    console.log("Error in resendSignupOtp" ,error);
    res.redirect("/error-500");
  }
};

//*********************************************************  LOG_OUT  ************************************************************//

module.exports.logout = async (req, res) => {
  try{
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
  }catch(error){
    console.log("Error in logout" ,error);
    res.redirect("/error-500");
  }
};

//*********************************************************  PROFILE  ************************************************************//

module.exports.profilePage = async (req, res) => {
  try {
    const user = res.locals.user;
    const token = res.locals.user;
    const category = await Category.find({ is_listed: true });

    res.render("profile", { user, category, token });
  } catch (error) {
    console.log("Error in profilePage" ,error);
    res.redirect("/error-500");
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
    console.log("Error in editProfilePage" ,error);
    res.redirect("/error-500");

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
    console.log("data", data);

    if (!req.body.fname || req.body.fname.trim().length === 0) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "First Name is required",
      });
    }
    if (!req.body.lname || req.body.lname.trim().length === 0) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "Last Name is required",
      });
    }

    if (!req.body.email || req.body.email.trim().length === 0) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "E-Mail is required",
      });
    }
    if (!req.body.number || req.body.number.trim().length === 0) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "Phone Number is required",
      });
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "Name should not contain numbers",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "Email Not Valid",
      });
    }

    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
      return res.render("editProfile", {
        userdata: userdata,
        message: "Mobile Number should have 10 digit",
      });
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
    res.redirect("/error-500");

  }
};

//***************************************************************  CHECKOUT PAGE  *******************************************************//

//GET
module.exports.checkoutPage = async (req, res) => {
  try {
    const token = res.locals.user;
    let subtotal = 0;
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
    console.log("Error in checkoutPage" ,error);
    res.redirect("/error-500");
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
          _id: new mongoose.Types.ObjectId(products[0]._id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          category: 1,
          is_listed: "$category.is_listed",
        },
      },
    ]);
    if (
      products.length === 0 ||
      category.length === 0 ||
      isListed[0].is_listed[0] === false
    ) {
      res.render("error-404");
    } else {
      res.render("category", { products, category, token });
    }
  } catch (err) {
    console.log("Error from categoryPage", err);
    res.redirect("/error-500");
  }
};

//***************************************************************  ERROR PAGES  *******************************************************//

module.exports.error_500 = async (req, res) => {
  try {
    res.render("errorPages/block500");
  } catch (error) {
    console.log("Error from error_500", error);
  }
};

module.exports.error_404 = async (req, res) => {
  try {
    res.render("errorPages/error-404");
  } catch (error) {
    console.log("Error from error_404", error);
  }
};

module.exports.error_403 = async (req, res) => {
  try {
    res.render("errorPages/blocked");
  } catch (error) {
    console.log("Error from error_403", error);
  }
};