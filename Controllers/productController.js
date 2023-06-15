const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")

const multer = require("multer")

//***************************************************************  PRODUCT-MANAGEMENT PAGE  *******************************************************//

//GET
module.exports.productManagement = async (req ,res) => {
    try {
        const find = await productData.findOne({}).populate('category')
        console.log(find);
        console.log(find.category.name);

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/product-images/');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
});
  
const upload = multer({ storage: storage }).single('image');
  
//POST
module.exports.newProduct = async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
        } 
        else if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
        }
  
        const { name, description, category, brand } = req.body;
        const image = req.file.filename;
  
        const newProduct = new productData({
            name,
            brand,
            description,
            image,
            category,
            // price
        });
        newProduct
        .save()
        .then(() => {
            res.redirect('/admin/product');
            console.log('product added');
        })
        .catch((err) => {
          console.error('Error adding product:', err);
          res.status(500).send('Error adding product to the database');
        });
    });
};

//***************************************************************  UPDATE-PRODUCT PAGE  *******************************************************//

//GET
module.exports.updateProduct = async (req ,res) => {
    try {
        req.query._id
        console.log('updateproduct');
        const category = await categoryData.find({})
        res.render('updateProduct',{ category: category })
        }
    catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//
