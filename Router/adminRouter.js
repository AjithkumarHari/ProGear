// const router = require('express').Router()
const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

const multer = require("multer");

// const multer = require("../multer/multer");

const adminController = require("../Controllers/adminController")
const productController = require("../Controllers/productController")
const categoryController = require("../Controllers/categoryController")

const validate = require("../Authentication/adminAuthentication")



router.set('view engine', 'hbs')
router.set('views',  './Views/adminViews')


router.use(express.json())
router.use(express.urlencoded({ extended : false }))



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
const multipleUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name:"image" ,maxCount:2 }])


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
router.post('/updateProduct',productController.editProduct)


//                                                   CATEGORY
router.get('/category',categoryController.categoryManagement)

router.get('/addCategory',categoryController.addCategory)
router.post('/addCategory',categoryController.newCategory)

router.get('/updateCategory',categoryController.updateCategory)
router.post('/updateCategory',categoryController.editCategory)

router.get('/changeStatus', categoryController.changeStatus)


router.get('/logout',adminController.logout)



module.exports = router




