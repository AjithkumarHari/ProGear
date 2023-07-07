const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")

// const multer = require("../multer/multer");

const multer = require("multer")
const path = require('path');
const { log } = require("console");


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

//POST   
module.exports.newProduct = async (req, res) => {
try{

    const { name, description, category, price , brand} = req.body;

    if(price<0){
        const category = await categoryData.find({})
        res.render('addProduct',{ category: category },{message:"price must be above 0"})
    }else{
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
        
    }
}
    // console.log(req.files);
   
      catch(err) {
        console.error("Error adding product:", err);
        res.status(500).send("Error adding product to the database");
          }
};

//***************************************************************  UPDATE-PRODUCT PAGE  *******************************************************//

//GET
module.exports.updateProduct = async (req ,res) => {
    try {
        id = req.query.userid
        console.log('updateproduct');
        const product = await productData.findOne({_id : id })
        const category = await categoryData.find({ })
        res.render('updateProduct',{ product: product , category : category})
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
        // console.log('id',id);

        const filesArray = Object.values(req.files).flat();
        const image = filesArray.map((file) => file.filename);

        const result = await productData.updateOne({_id : id}, {$set:{name : req.body.name , description : req.body.des, brand : req.body.brand, image : image , price : req.body.price}})
        // console.log(result);
    
        res.redirect('/admin/product');
    
    }catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//



module.exports.unlistProduct = async(req,res)=>{
    try {
    //   await productHelper.unListProduct(req.query.id)
      const id = req.query.id;
      const categorylisted = await productData.findOne({ _id: id }).populate('category');
      
      if (categorylisted.category.is_listed === true) {
        const result = await productData.updateOne({ _id: id }, {$set:{ is_product_listed: true }});
        console.log(result);
      } else {
        console.log('Cannot Relist');

      }

        res.redirect('/admin/product')
        
    } catch (error) {
        console.log(error.message);
    }
  }

module.exports.reListProduct = async(req,res)=>{
    try {

        // await productHelper.reListProduct(req.query.id)
        const id = req.query.id;
        const result = await productData.updateOne({ _id: id }, {$set:{ is_product_listed: false }})
        console.log(result);

        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
  }