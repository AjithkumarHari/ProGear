// const router = require('express').Router()
const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

const multer = require("multer");

const multerr = require("../Config/multer");

const adminController = require("../Controllers/adminController")
const productController = require("../Controllers/productController")
const categoryController = require("../Controllers/categoryController")
const couponController = require("../Controllers/couponController")
const bannerController = require("../Controllers/bannerController")

const validate = require("../Authentication/adminAuthentication");
const { route } = require('./usersRouter');

router.set('views','./Views/adminViews')

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
router.use(cookieparser())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/product-images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: 'image1', maxCount: 1 }, { name:"image2" ,maxCount:2 }])


router.get('/', adminController.adminLogin)
router.post('/login', adminController.verifyLogin)

router.get('/landing', validate.authenticate,adminController.adminDashboard)

router.get('/user',validate.authenticate, adminController.userManagement)


router.get('/block',adminController.changeStatus)


//                                                   PRODUCT

router.get('/product',validate.authenticate,productController.productManagement)

router.get('/addProduct',productController.addProduct)
router.post('/addProduct',multipleUpload,productController.newProduct)

router.get('/updateProduct',productController.updateProduct)
router.post('/updateProduct',multipleUpload,productController.editProduct)


//                                                   CATEGORY
router.get('/category',categoryController.categoryManagement)

router.get('/addCategory',categoryController.addCategory)
router.post('/addCategory',categoryController.newCategory)

router.get('/updateCategory',categoryController.updateCategory)
router.post('/updateCategory',categoryController.editCategory)

router.get('/changeStatus', categoryController.changeStatus)

router.get('/unlistProduct',productController.unlistProduct)

router.get('/reListProduct',productController.reListProduct)



//-------------------------------------------ORDER--------------------------------------------
router.get('/order',adminController.orderManagement)

router.get('/orderData',adminController.orderDetails)

router.put('/orderStatus',adminController.changeStatus)

router.put('/cancelStatus',adminController.cancelOrder)

router.put('/returnOrder', adminController.returnOrder)


//-------------------------------------------COUPON--------------------------------------------

router.get('/coupon',couponController.couponList)

router.get('/addCoupon',couponController.loadCouponAdd)

router.post('/addCoupon',couponController.addCoupon)

router.get('/generateCouponCode',couponController.generateCouponCode)

//-------------------------------------------BANNER--------------------------------------------

router.get('/banner',bannerController.bannerList)

router.get('/addBanner',bannerController.addBannerGet)

router.post('/addBanner',multerr.addBannerupload,bannerController.addBannerPost)

router.get('/deleteBanner',bannerController.deleteBanner)

router.get('/logout',adminController.logout)

//-------------------------------------------BANNER--------------------------------------------
router.get('/salesReport',adminController.getSalesReport)

router.post('/salesReport',adminController.postSalesReport)

module.exports = router




