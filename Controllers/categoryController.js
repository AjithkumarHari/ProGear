const categoryData = require("../Model/categoryModel")

//GET
module.exports.categoryManagement = async (req ,res) => {
    try {
        const find = await categoryData.find({})
        res.render('categoryManagement', { find: find })
    } catch (error) {
        console.log("Error from categoryManagement", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.addCategory = async (req ,res) => {
    try {
        const find = await categoryData.find({})
        res.render('addCategory', { find: find })
    } catch (error) {
        console.log("Error from addCategory", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.newCategory = async (req ,res) => {
    try {
        const categoryName = req.body
        const categoryExist = await categoryData.findOne({name : categoryName})
        if(categoryExist){
            res.render('addCategory',{message : "Category Already Exist"})
        }
        else{
            const category = new categoryData({name:req.body.name, description: req.body.des});
            await category.save();
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log("Error from newCategory", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.updateCategory = async (req ,res) => {
    try {
        const id = req.query.userid;
        const category = await categoryData.findOne({ _id: id });
        res.render('updateCategory',{ category: category })
        }
    catch (error) {
        console.log("Error from updateCategory", error);
        res.redirect("/error-500");
    }
}

module.exports.editCategory = async (req, res) =>{
    try{
        const id = req.body.id
        await categoryData.updateMany({_id : id}, {$set:{name : req.body.name , description : req.body.des}})
        res.redirect('/admin/category')
    }
    catch (error) {
        console.log("Error from editCategory", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.changeStatus = async (req, res) =>{
    try{
        const id = req.query.userid;
        const userData = await categoryData.findOne({ _id: id });
        if (userData) {
            const newStatus = !userData.is_listed;
            await categoryData.updateOne({ _id: id }, { $set: { is_listed: newStatus } });
            res.redirect('/admin/category');
        } else {
            res.redirect('/admin/category');
        }
    }catch (error) {
        console.log("Error from changeStatus", error);
        res.redirect("/error-500");
    }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//