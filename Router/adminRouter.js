const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

const multer = require("multer");

const multerr = require("../Multer/multer");

const adminController = require("../Controllers/adminController")
const productController = require("../Controllers/productController")
const categoryController = require("../Controllers/categoryController")
const couponController = require("../Controllers/couponController")
const bannerController = require("../Controllers/bannerController")


const validate = require("../Authentication/adminAuthentication");

router.set('views','./Views/adminViews')

router.use(session({
    secret: 'keyboard cat', 
    resave: false,
    saveUninitialized: true,
  }))
router.use(cookieparser())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Public/product-images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: 'image1', maxCount: 1 }, { name:"image2" ,maxCount:2 }])


router.get('/', adminController.adminLogin)

router.post('/login', adminController.verifyLogin)

router.get('/landing',validate.authenticate,adminController.loadDashboard)

router.get('/logout',adminController.logout)

//-------------------------------------------USER--------------------------------------------

router.get('/user',validate.authenticate, adminController.userManagement)

router.post('/block',adminController.changeUserStatus)

//-------------------------------------------PRODUCT--------------------------------------------

router.get('/product',validate.authenticate,productController.productManagement)

router.get('/addProduct',productController.addProduct)

router.post('/addProduct',multipleUpload,productController.newProduct)

router.get('/updateProduct',productController.updateProduct)

router.post('/updateProduct',multerr.editProduct,productController.editProduct)

router.post('/unlistProduct',productController.unlistProduct)

//-------------------------------------------CATAGORY--------------------------------------------

router.get('/category',validate.authenticate,categoryController.categoryManagement)

router.get('/addCategory',categoryController.addCategory)

router.post('/addCategory',categoryController.newCategory)

router.get('/updateCategory',categoryController.updateCategory)

router.post('/updateCategory',categoryController.editCategory)

router.post('/changeStatus', categoryController.changeStatus)

//-------------------------------------------ORDER--------------------------------------------

router.get('/order',validate.authenticate,adminController.orderManagement)

router.get('/orderData',adminController.orderDetails)

router.put('/orderStatus',adminController.changeStatus)

router.put('/cancelStatus',adminController.cancelOrder)

router.put('/returnOrder', adminController.returnOrder)

//-------------------------------------------COUPON--------------------------------------------

router.get('/coupon',validate.authenticate,couponController.couponList)

router.get('/addCoupon',couponController.loadCouponAdd)

router.post('/addCoupon',couponController.addCoupon)

router.get('/generateCouponCode',couponController.generateCouponCode)

router.post('/removeCoupon',couponController.removeCoupon)

//-------------------------------------------BANNER--------------------------------------------

router.get('/banner',validate.authenticate,bannerController.bannerList)

router.get('/addBanner',bannerController.addBannerGet)

router.post('/addBanner',multerr.addBannerupload,bannerController.addBannerPost)

router.get('/updateBannerGet',bannerController.editBanner)

router.post('/updateBannerPost',multerr.editBannerupload,bannerController.updateBanner)

router.post('/deleteBanner',bannerController.deleteBanner)

//-------------------------------------------SALES REPORT--------------------------------------------
router.get('/salesReportGet',validate.authenticate,adminController.getSalesReport)

router.post('/salesReportPost',adminController.postSalesReport)


module.exports = router