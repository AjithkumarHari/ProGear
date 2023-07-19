const express = require('express')
const router = express()
const cookieparser = require('cookie-parser')
const session = require('express-session')

const validate = require('../Authentication/userAutentication')
const config = require('../Config/isProductListed')

const userController = require("../Controllers/userController")
const cartController = require('../Controllers/cartController')
const addressController =  require('../Controllers/addressController')
const orderController = require('../Controllers/orderController')
const wishlistController = require("../Controllers/wishlistController")
const { route } = require('./adminRouter')

router.set('views','./Views/userViews')

router.use(express.urlencoded({ extended : false }))
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
router.use(cookieparser())


router.all('*',validate.checkUser)

router.get('/',validate.checkBlocked,userController.homePage)

router.get('/login',userController.loginPage)
router.post('/login',userController.loginVerify)

router.get('/forgotPasswordNum',userController.forgotPasswordNum)
router.post('/forgotPasswordNum',userController.forgotPasswordOtp)
router.post('/fpOtp',userController.fpOtpVerify)
router.post('/setNewPassword',userController.setNewPassword)
router.get('/setNewPassword',userController.setNewPasswordGet)

router.get('/signup',userController.signupPage)
router.post('/signup',userController.signupAction)
router.get('/signupOtp',userController.signupOtp)
router.post('/signupOtpVerify',userController.verifySignupOtp)
router.get('/resendLoginOtp',userController.resendLoginOtp)
router.get('/resendSignupOtp',userController.resendSignupOtp)

router.get('/logout',userController.logout)

//Get Prouct Page 
router.get('/product',validate.checkBlocked,userController.productPage)

//Get category page
router.get('/category',validate.authenticate,validate.checkBlocked, userController.categoryPage)

// ----------------------------------------------------------------CART------------------------------------------------------------------------------

//Get Cart Page 
router.get('/cart',validate.authenticate,validate.checkBlocked,cartController.cartPage)

router.post('/addToCart',config.productConfig, cartController.addToCart);

router.delete('/removeFromCart',cartController.removeFromCart)

router.post('/changeItemQuantity',cartController.changeItemQuantity)
// ----------------------------------------------------------------PROFILE------------------------------------------------------------------------------

router.get('/profile',validate.authenticate,validate.checkBlocked,validate.authenticate,validate.checkBlocked,userController.profilePage)

router.get('/editProfile',validate.authenticate,validate.checkBlocked,userController.editProfilePage)

router.post('/updateProfile',userController.updateProfile)
// ----------------------------------------------------------------ADDRESS------------------------------------------------------------------------------

router.get('/userAddress',validate.authenticate,validate.checkBlocked,addressController.viewAddress)

router.post('/addNewAddress',addressController.addNewAddress)

router.post('/editAddress',addressController.editAddress)

router.post('/changeDefaultAddress',addressController.changeDefaultAddress)

router.get('/deleteAddress/',validate.authenticate,validate.checkBlocked,addressController.deleteAddress)
// ----------------------------------------------------------------CHECKOUT------------------------------------------------------------------------------

//Get Checkout Page 
router.get('/checkout',validate.authenticate,validate.checkBlocked,userController.checkoutPage)
//Post Checkout Page 
router.post('/checkout',orderController.checkout)
//Post of Razorpay
router.post('/verifyRazorpayPayment',orderController.verifyRazorpayPayment) 
// ----------------------------------------------------------------COUPON------------------------------------------------------------------------------

router.post('/couponVerify',orderController.verifyCoupon)

router.post('/applyCoupon',orderController.applyCoupon)
// ----------------------------------------------------------------ORDER------------------------------------------------------------------------------


router.get('/orderDetails',validate.authenticate,validate.checkBlocked,orderController.orderDetails)

router.get('/order',validate.authenticate,validate.checkBlocked,orderController.orderList)

router.put('/cancelOrder',orderController.cancelOrder)
// ----------------------------------------------------------------ORDER------------------------------------------------------------------------------

router.get('/wishlist',validate.authenticate,validate.checkBlocked,wishlistController.getWishList)

router.post('/addToWishlist',config.productConfig,wishlistController.addWishList)

router.delete('/removefromwishlist',wishlistController.removeProductWishlist)
// ----------------------------------------------------------------ERROR------------------------------------------------------------------------------

router.get('/error-500',userController.error_500)

router.get('/error-404',userController.error_404)

router.get('/error-403',userController.error_403)


module.exports = router