// const router = require('express').Router()
const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

const userController = require("../Controllers/userController")
const validate = require('../authentication/userAutentication')

const cartController = require('../Controllers/cartController')

router.set('view engine', 'hbs')
router.set('views',  './Views/userViews')


// // Configure Handlebars as the template engine
// router.engine(
//   'hbs',
//   exphbs({
//     extname: '.hbs',
//     // Register the custom helper
//     helpers: {
//       multiply: function(a, b) {
//         return a * b;
//       },
//     },
//   })
// );


router.use(express.json())
router.use(express.urlencoded({ extended : false }))


router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
router.use(cookieparser())

router.get('*',validate.checkUser)

router.get('/',userController.homePage)

router.get('/login',userController.loginPage)
router.post('/login',userController.loginVerify)

router.get('/forgotPasswordNum',userController.forgotPasswordNum)
router.post('/forgotPasswordNum',userController.forgotPasswordOtp)
router.post('/fpOtp',userController.fpOtpVerify)
router.post('/setNewPassword',userController.setNewPassword)

router.get('/signup',userController.signupPage)
router.post('/signup',userController.signupAction)

router.post('/signupOtpVerify',userController.verifySignupOtp)

router.get('/resendLoginOtp',userController.resendLoginOtp)
router.get('/resendSignupOtp',userController.resendSignupOtp)

router.get('/logout',userController.logout)


//Get Prouct Page 
router.get('/product',userController.productPage)

//Get Cart Page 
router.get('/cart',validate.authenticate,cartController.cartPage)
router.get('/addToCart',cartController.addToCart)
router.get('/removeFromCart',cartController.removeFromCart)

router.get('/profile',userController.profilePage)
router.get('/editProfile',userController.editProfilePage)

//Get Checkout Page 
router.get('/checkout',userController.checkoutPage)





module.exports = router

