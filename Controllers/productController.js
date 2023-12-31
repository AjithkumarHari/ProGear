const productData = require("../Model/productModel")
const categoryData = require("../Model/categoryModel")

const adminHelper = require('../Helper/adminHelper')


//***************************************************************  PRODUCT-MANAGEMENT PAGE  *******************************************************//

//GET
module.exports.productManagement = async (req ,res) => {
    try {
        const find = await productData.find({}).populate('category')
        res.render('productManagement', { find: find })
    } catch (error) {
        console.log("Error from productManagement", error);
        res.redirect("/error-500");
    }
}


//***************************************************************  ADD-PRODUCT PAGE  *******************************************************//

//GET
module.exports.addProduct = async (req ,res) => {
    try {
        const category = await categoryData.find({})
        res.render('addProduct',{ category: category })
        }
    catch (error) {
        console.log("Error from addProduct", error);
        res.redirect("/error-500");
    }
}

//POST   
module.exports.newProduct = async (req, res) => {
try{

    const { name, description, category, price ,stock , brand} = req.body;
    const categories = await categoryData.find({})
        const filesArray = Object.values(req.files).flat();
        const image = filesArray.map((file) => file.filename);
        const newProduct = new productData({
          name,
          description,
          image,
          brand,
          category,
          price,
          stock
        });
        newProduct
          .save()
          .then(() => {
            res.redirect('/admin/product');
          })
}
      catch(err) {
        console.error("Error adding product:", err);
        res.status(500).send("Error adding product to the database");
      }
};

//***************************************************************  UPDATE-PRODUCT PAGE  *******************************************************//

//GET 
module.exports.updateProduct = async (req ,res) => {
    try {
        const id = req.query.userid
        const product = await productData.findOne({_id : id }).populate('category')
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
    try { 
        adminHelper.updateProductHelper(req.body, req?.file?.filename).then(( response) => {
            if (response) {
                res.redirect("/admin/product");
            } else {
                res.status(505);
            }
        });}
    catch (error) {
        console.log(error.message);
    }
} 

module.exports.unlistProduct = async(req,res)=>{
    try {
        const id = req.body.id;
        const categorylisted = await productData.findOne({ _id: id }).populate('category');
        const userData = categorylisted.is_product_listed
        if (categorylisted.category.is_listed === true) {
            if(categorylisted){
                const newStatus = !userData;
                await productData.updateOne({ _id: id }, {$set:{ is_product_listed: newStatus }});
            }
        } 
            res.redirect('/admin/product') 
    } catch (error) {
        console.log("Error from productManagement", error);
        res.redirect("/error-500");
    }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//