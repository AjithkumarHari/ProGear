const Address = require("../Model/adderssModel")
const Category = require('../Model/categoryModel')

const addressHelper = require("../Helper/addressHelper");

//GET EDIT ADDRESS

module.exports.viewAddress = async (req, res) => {
    try {
      const userId = res.locals.user.id;
      // console.log(userId);
      const addressDetails = await addressHelper.getAddressDetails(userId);
      const category = await Category.find({ })

      // console.log("addressDetails",addressDetails);

  
      if (addressDetails) {
        res.render('address', { addressDetails , userId , category, token:null});
      } else {
        res.render('address',{addressDetails:[],category, token:null});
      }
    } catch (error) {
      console.log(error);
      res.send({ success: false, error: error.message });
    }
  };





   
//POST ADD NEW ADDRESS

module.exports.addNewAddress = async (req, res) =>{
    try {
        // console.log('Add New Adderss');
        if(addressHelper.addNewAddressHelper(req.body,res.locals.user.id)){
            res.redirect('/userAddress')
        }
        
    } catch (error) {
        console.log(error);
        res.send({ success: false, error: error.message });
    }
    
};





//GET EDIT ADDRESS


module.exports.editAddress = async (req, res) =>{
  try {
      // console.log('Edit Adderss');
      // console.log('edit address',req.body);
      if(addressHelper.editAddressHelper(req.body,res.locals.user.id)){
        res.redirect('/userAddress')
    }
  } catch (error) {
      console.log(error);
      res.send({ success: false, error: error.message });
  }
  
};





module.exports.deleteAddress = async (req, res) =>{
  try {
      const id = req.query
      // console.log('Delete Adderss',id);

      // console.log('edit address',req.body);
      if(addressHelper.deleteAddressHelper(id,res.locals.user.id)){
        res.redirect('/userAddress')
    }
  } catch (error) {
      console.log(error);
      res.send({ success: false, error: error.message });
  }
  
};





//POST
module.exports.changeDefaultAddress = async (req, res) =>{
  
  try {
    const userId=res.locals.user._id.toString()
    // console.log('userid',userId);
    const result = req.body.addressRadio;

    const user = await Address.findOne({user_data: userId });
    // console.log('user addresses',user);
    // console.log('user default address',user.address);


    const addressIndex = user.address.findIndex((address) => address._id.equals(result));
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    // console.log(addressIndex);

    const removedAddress = user.address.splice(addressIndex, 1)[0];
    user.address.unshift(removedAddress);
    // console.log( user.address);


    const final=await Address.updateOne({user_data: userId }, { $set: { address: user.address } });
    // console.log(final);
    res.redirect('/checkout')

  } catch (error) {
    console.log(error.message);
  }

}




