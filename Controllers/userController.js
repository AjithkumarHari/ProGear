const _ = require("lodash");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

const userData = require("../Model/userModel");
const productData = require("../Model/productModel");
const cartData = require("../Model/cartModel");
const addressData = require("../Model/adderssModel");
const Category = require("../Model/categoryModel");
const Banner = require("../Model/bannerModel");

const otpHelper = require("../Helper/otpHelper");
const userHelpers = require("../Helper/userHelper")
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
    }).limit(12);
    
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
      isListed[0].is_listed[0] === false ||
      product===[]
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
    res.redirect("/error-404");
  }
};

//***************************************************************  Helper Functions  *******************************************************//

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: maxAge });
};

//****************************************************************  LOG_IN  *******************************************************//

//GET
module.exports.loginPage = async (req, res) => {
  try {
    if (res.locals.user != null) {
      res.redirect("/");
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
      await otpHelper.sendOtp(req.body.number)
      req.session.email = user.email;
      req.session.number = req.body.number;
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
    const reqOtp = req.body.otp;
    const otp = await otpHelper.verifyCode(req.session.number,reqOtp)
    if (otp) {
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
    if(req.session.email){
      const email = req.session.email;
      console.log('email',email);
      await userData.updateOne(
        { email: email },
        { $set: { password: newpw } }
      );
      res.redirect("/login");
    }else{
      const email = res.locals.user.email;
      console.log('email',email);
      await userData.updateOne(
        { email: email },
        { $set: { password: newpw } }
      );
      res.redirect("/profile");
    }
  } catch (error) {
    console.log("Error in setNewPassword" , error);
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
    const data = {
      fname,
      lname,
      email,
      password,
      number,
    };
    const existingUser = await userData.findOne({ email: email });
    if (existingUser) {
      return res.render("signup", { message: "Email already exists" });
    }
     else {
      req.session.userData = data;
      req.session.number = req.body.number;
      await otpHelper.sendOtp(number);
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
    if (!newUser) {
      res.send("Invalid Session");
    } 
    const otp = await otpHelper.verifyCode(req.session.number,userOtp)
     if (!otp) {
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
    res.render("editProfile", { userdata: userdata });
  } catch (error) {
    console.log("Error in editProfilePage" ,error);
    res.redirect("/error-500");

  }
};

//POST
module.exports.updateProfile = async (req, res) => {
  try {
    const user = res.locals.user;
    const data = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      number: req.body.number,
    };
    await userData.updateOne(
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
    res.redirect("/profile");
  } catch (error) {
    console.log("Error in updateProfile" ,error);
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

const ITEMS_PER_PAGE = 3; // Number of products to display per page

module.exports.categoryPage = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const token = res.locals.user;
    const category = await Category.find({ is_listed: true });
    const sortQuery = req.query.sort || "default";
    const page = parseInt(req.query.page) || 1; // Current page number from the request query

    let sortOption = {};
    if (sortQuery === 'price_asc' || sortQuery === 'default') {
      sortOption = { price: 1 }; 
    } else if (sortQuery === 'price_desc') {
      sortOption = { price: -1 }; 
    }

    // Calculate the skip value to get the appropriate page of products
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Get the total count of products matching the category and is_listed criteria
    const totalCount = await productData.countDocuments({
      category: new mongoose.Types.ObjectId(categoryId),
      is_product_listed: true,
    });

    const products = await productData.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
          is_product_listed: true,
        },
      },
      { $sort: sortOption },
      { $skip: skip }, // Skip the appropriate number of products
      { $limit: ITEMS_PER_PAGE }, // Limit the number of products per page
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
      res.redirect("/error-404");
    } else {

      res.render("category", {
        products,
        category,
        token,
        categoryId,
        currentPage: page, // Pass the current page number to the view
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE), // Calculate the total number of pages
      });
    }
  } catch (err) {
    console.log("Error from categoryPage", err);
    res.redirect("/error-500");
  }
};


//GET

const ITEM_in_PAGE = 6; // Number of products to display per page

module.exports.productList = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const token = res.locals.user;
    const category = await Category.find({ is_listed: true });
    const sortQuery = req.query.sort || "default";
    const page = parseInt(req.query.page) || 1; // Current page number from the request query

    let sortOption = {};
    if (sortQuery === 'price_asc' || sortQuery === 'default') {
      sortOption = { price: 1 }; 
    } else if (sortQuery === 'price_desc') {
      sortOption = { price: -1 }; 
    }

    // Calculate the skip value to get the appropriate page of products
    const skip = (page - 1) * ITEM_in_PAGE; // Use ITEM_PER_PAGE here

    // Get the total count of products matching the category and is_listed criteria
    const totalCount = await productData.countDocuments({ 

      is_product_listed: true,
    });

    const products = await productData.aggregate([
      {
        $match: {
          is_product_listed: true,
        },
      },
      { $sort: sortOption },
      { $skip: skip }, // Skip the appropriate number of products
      { $limit: ITEM_in_PAGE }, // Limit the number of products per page, use ITEM_PER_PAGE here
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
      res.redirect("/error-404");
    } else {
      res.render("productList", {
        products,
        category,
        token,
        categoryId,
        currentPage: page, // Pass the current page number to the view
        totalPages: Math.ceil(totalCount / ITEM_in_PAGE), // Calculate the total number of pages, use ITEM_PER_PAGE here
      });
    }
  } catch (err) {
    console.log("Error from productList", err);
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

//***************************************************************  WALLET PAGES  *******************************************************//

//GET
module.exports.wallet = async (req, res) => {
  try {
    const user = res.locals.user;
    const token = res.locals.user;
    const category = await Category.find({ is_listed: true });
    res.render("wallet", { user, category, token });
  } catch (error) {
    console.log("Error in wallet" , error);
    res.redirect("/error-500");

  }
};

//POST
module.exports.walletRecharge= async(req,res)=>{
  try {
      const userId=res.locals.user._id
      const total=req.body.total
      const razorpayResponse = await userHelpers.generateRazorpayForWallet(userId,total);
      const user = await userData.findById({ _id: userId }).lean()
      res.json({
          razorpayResponse:razorpayResponse,
          userDetails: user,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      });
  } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')
  }
}

//POST
module.exports.verifyWalletRecharge = async(req,res)=>{
  try {
      userHelpers.verifyOnlinePayment(req.body).then(()=>{
          const razorpayAmount=parseInt(req.body['serverOrderDetails[razorpayResponse][amount]'])
          const amount=parseInt(razorpayAmount/100)
          userHelpers. rechargeUpdateWallet(req.body['serverOrderDetails[razorpayResponse][receipt]'],amount).then(()=>{
              res.json({ status: true });
          })
      })
      .catch((err) => {
          console.log(err);
          res.json({ status: false });
      });
  } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')
  }
}