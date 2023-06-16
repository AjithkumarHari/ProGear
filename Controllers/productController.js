const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")

// const multer = require("../multer/multer");

const multer = require("multer")
const path = require('path');


//***************************************************************  PRODUCT-MANAGEMENT PAGE  *******************************************************//

//GET
module.exports.productManagement = async (req ,res) => {
    try {
        const find = await productData.find({}).populate('category')
  
        res.render('productManagement', { find: find })
        console.log("product Management loaded")
    } catch (error) {
        res.send("error")
        console.log(error.message);
    }
}


//***************************************************************  ADD-PRODUCT PAGE  *******************************************************//

//GET
module.exports.addProduct = async (req ,res) => {
    try {
        console.log('addproduct');
        const category = await categoryData.find({})
        res.render('addProduct',{ category: category })
        }
    catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/product-images/');
//     },
//     filename: function (req, file, cb) {
//       const fileName = Date.now() + path.extname(file.originalname);
//       cb(null, fileName);
//     }
// });
  
// const upload = multer({ storage: storage }).array('image');
  

//POST   
module.exports.newProduct = async (req, res) => {

    const { name, description, category, price , brand} = req.body;

    console.log(req.files);
    const filesArray = Object.values(req.files).flat();
    const image = filesArray.map((file) => file.filename);
  
    const newProduct = new productData({
      name,
      description,
      image,
      brand,
      category,
      price,
    });
  
    newProduct
      .save()
      .then(() => {
        res.redirect('/admin/product');
      })
      .catch((err) => {
        console.error("Error adding product:", err);
        res.status(500).send("Error adding product to the database");
      });
};

//***************************************************************  UPDATE-PRODUCT PAGE  *******************************************************//

//GET
module.exports.updateProduct = async (req ,res) => {
    try {
        id = req.query.userid
        console.log('updateproduct');
        const product = await productData.findOne({_id : id })
        res.render('updateProduct',{ product: product })
        }
    catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//POST 
module.exports.editProduct = async (req, res) => {
    try{
        const id = req.body.id
        const result = await categoryData.updateMany({_id : id}, {$set:{name : req.body.name , description : req.body.des, brand : req.body.brand, }})

        res.redirect('/admin/category')
    }catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//
