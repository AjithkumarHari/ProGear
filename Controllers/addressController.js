const Address = require("../Model/adderssModel")
const Category = require('../Model/categoryModel')
const addressHelper = require("../Helper/addressHelper");

//GET 
module.exports.viewAddress = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const addressDetails = await addressHelper.getAddressDetails(userId);
    const category = await Category.find({ is_listed: true });
    if (addressDetails) {
      res.render('address', { addressDetails , userId , category, token:null});
    } else {
      res.render('address',{addressDetails:[],category, token:null});
    }
  } catch (error) {
    console.log("Error from viewAddress", error);
    res.redirect("/error-500");
  }
};

//POST
module.exports.addNewAddress = async (req, res) =>{
  try {
    if(addressHelper.addNewAddressHelper(req.body,res.locals.user.id)){
        res.redirect('/userAddress')
    }
  } catch (error) {
      console.log("Error from addNewAddress", error);
      res.redirect("/error-500")
  }
};

//GET 
module.exports.editAddress = async (req, res) =>{
  try {
      if(addressHelper.editAddressHelper(req.body,res.locals.user.id)){
        res.redirect('/userAddress')
    }
  } catch (error) {
      console.log("Error from editAddress", error);
      res.redirect("/error-500")
  }
};

//POST
module.exports.deleteAddress = async (req, res) =>{
  try {
    const id = req.query
      if(addressHelper.deleteAddressHelper(id,res.locals.user.id)){
        res.redirect('/userAddress')
    }
  } catch (error) {
    console.log("Error from deleteAddress", error);
    res.redirect("/error-500")
  }
};

//POST
module.exports.changeDefaultAddress = async (req, res) =>{
  try {
    const userId=res.locals.user._id.toString()
    const result = req.body.addressRadio;
    const user = await Address.findOne({user_data: userId });
    const addressIndex = user.address.findIndex((address) => address._id.equals(result));
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }
    const removedAddress = user.address.splice(addressIndex, 1)[0];
    user.address.unshift(removedAddress);
    await Address.updateOne({user_data: userId }, { $set: { address: user.address } });
    res.redirect('/checkout')
  } catch (error) {
    console.log("Error from changeDefaultAddress", error);
    res.redirect("/error-500")
  }
}