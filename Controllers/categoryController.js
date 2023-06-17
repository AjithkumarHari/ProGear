const categoryData = require("../Model/categoryModel")

//***************************************************************  CATEGORY MANAGEMENT PAGE  *******************************************************//

module.exports.categoryManagement = async (req ,res) => {
    try {
        const find = await categoryData.find({})
        res.render('categoryManagement', { find: find })
        console.log("category Management loaded")
    } catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//***************************************************************  ADD CATEGORY   *******************************************************//

//GET
module.exports.addCategory = async (req ,res) => {
    try {
        const find = await categoryData.find({})
        res.render('addCategory', { find: find })
        console.log("category Management loaded")
    } catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

//POST
module.exports.newCategory = async (req ,res) => {
    try {
        const categoryName = req.body.name
        const categoryExist = await categoryData.findOne({name : categoryName})
        console.log(categoryExist);
        if(categoryExist){
            res.render('addCategory',{message : "Category Already Exist"})
        }
        else{
            const category = new categoryData({name:req.body.name, description: req.body.des});
            const savedCategory = await category.save();
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Failed to create category' });
    }
    
}


//***************************************************************  UPDATE CATEGORY   *******************************************************//


//GET
module.exports.updateCategory = async (req ,res) => {
    try {
        console.log('updateCategory');

        const id = req.query.userid;

        const category = await categoryData.findOne({ _id: id });

        
        res.render('updateCategory',{ category: category })
        }
    catch (error) {
        res.send("error")
        console.log(error.message);
    }
}

module.exports.editCategory = async (req, res) =>{
    try{
        const id = req.body.id
        const result = await categoryData.updateMany({_id : id}, {$set:{name : req.body.name , description : req.body.des}})

        res.redirect('/admin/category')
    }
    catch (error) {
        res.send("Error")
        console.log(error.message);
    }
}


//***************************************************************  LIST/UNLIST CATEGORY   *******************************************************//

module.exports.changeStatus = async (req, res) =>{
    try{
        const id = req.query.userid;
        const userData = await categoryData.findOne({ _id: id });
    
        if (userData) {
            const newStatus = !userData.is_listed; // Toggle the value of is_listed
      
            await categoryData.updateOne({ _id: id }, { $set: { is_listed: newStatus } });
            res.redirect('/admin/category');
      
          } else {
            res.redirect('/admin/category');
          }
    }catch (error) {
        res.send("Error")
        console.log(error.message);
    }
}



//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX//
