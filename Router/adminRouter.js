// const router = require('express').Router()
const express = require('express')
const router = express()
const path = require('path');
const cookieparser = require('cookie-parser')
const session = require('express-session')

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

router.get('*',validate.checkUser)

router.get('/', adminController.adminLogin)
router.post('/login', adminController.verifyLogin)

router.get('/landing', adminController.adminDashboard)

router.get('/user', adminController.userManagement)


router.get('/block',adminController.changeStatus)


router.get('/product',productController.productManagement)
router.get('/addProduct',productController.addProduct)
router.post('/addProduct',productController.newProduct)

router.get('/updateProduct',productController.updateProduct)


router.get('/category',categoryController.categoryManagement)
router.get('/addCategory',categoryController.addCategory)
router.post('/addCategory',categoryController.newCategory)
router.get('/updateCategory',categoryController.updateCategory)
router.post('/updateCategory',categoryController.editCategory)
router.get('/changeStatus', categoryController.changeStatus)
// router.get('/login',adminController.loginPage)
// router.post('/login',adminController.loginVerify)

router.get('/logout',adminController.logout)



module.exports = router