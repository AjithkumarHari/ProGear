// const router = require('express').Router()
const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

const userController = require("../Controllers/userController")
const validate = require('../authentication/userAutentication')

const cartController = require('../Controllers/cartController')
const addressController =  require('../Controllers/addressController')
const orderController = require('../Controllers/orderController')


router.set('views','./Views/userViews')

router.use(express.urlencoded({ extended : false }))


router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
router.use(cookieparser())


router.all('*',validate.checkUser)

router.get('/',userController.homePage)

router.get('/login',userController.loginPage)
router.post('/login',userController.loginVerify)

router.get('/forgotPasswordNum',userController.forgotPasswordNum)
router.post('/forgotPasswordNum',userController.forgotPasswordOtp)
router.post('/fpOtp',userController.fpOtpVerify)
router.post('/setNewPassword',userController.setNewPassword)

router.get('/setNewPassword',userController.setNewPasswordGet)



router.get('/signup',userController.signupPage)
router.post('/signup',userController.signupAction)

router.post('/signupOtpVerify',userController.verifySignupOtp)

router.get('/resendLoginOtp',userController.resendLoginOtp)
router.get('/resendSignupOtp',userController.resendSignupOtp)

router.get('/logout',userController.logout)


//Get Prouct Page 
router.get('/product',userController.productPage)

//Get category page
router.get('/category', userController.categoryPage)

//Get Cart Page 
router.get('/cart',validate.authenticate,cartController.cartPage)
router.post('/addToCart/:id/:price', cartController.addToCart);
router.delete('/removeFromCart',cartController.removeFromCart)
router.post('/changeItemQuantity',cartController.changeItemQuantity)

router.get('/profile',validate.authenticate,userController.profilePage)
router.get('/editProfile',userController.editProfilePage)
router.post('/updateProfile',userController.updateProfile)
router.get('/userAddress',addressController.viewAddress)
router.post('/addNewAddress',addressController.addNewAddress)

router.post('/editAddress',addressController.editAddress)

router.post('/changeDefaultAddress',addressController.changeDefaultAddress)

router.get('/deleteAddress/',addressController.deleteAddress)
// ----------------------------------------------------------------CHECKOUT------------------------------------------------------------------------------

//Get Checkout Page 
router.get('/checkout',userController.checkoutPage)
//Post Checkout Page 
router.post('/checkout',orderController.checkout)
//Post of Razorpay
router.post('/verifyRazorpayPayment',orderController.verifyRazorpayPayment) 


// ----------------------------------------------------------------CHECKOUT------------------------------------------------------------------------------



router.post('/couponVerify',orderController.verifyCoupon)

router.post('/applyCoupon',orderController.applyCoupon)


// ----------------------------------------------------------------ORDER------------------------------------------------------------------------------


router.get('/orderDetails',orderController.orderDetails)

router.get('/order',orderController.orderList)

router.put('/cancelOrder',orderController.cancelOrder)



module.exports = router

