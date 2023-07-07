// const { identity } = require("lodash");
const mongoose = require('mongoose')
const Address = require("../Model/adderssModel");


// DISPLAY THE ADDRESSES OF THE USER
getAddressDetails = async (userId) => {
  try {
    const userAddress = await Address.findOne({ user_data: userId })
    

    // console.log("userAddress",userAddress);
    if (userAddress) {
      const addressDetails = userAddress.address.map((address) => {
        return {
          name: address.name,
          number: address.number, 
          houseAddress: address.houseAddress,
          city: address.city,
          street: address.street,
          pin: address.pin,
          id: address._id
        };
      });
      

      return addressDetails;
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};


//ADD NEW ADDRESS
addNewAddressHelper = async (newAddress,userId) => {
  try{
    console.log('add new address helper');
    const isExist = await Address.findOne({user_data : userId})
    // console.log('add',isExist);
    if(isExist){
      const user =({
        name: newAddress.name,
        number: newAddress.number,
        houseAddress: newAddress.houseadd,
        city: newAddress.city,
        street: newAddress.street,
        pin: newAddress.pin,
      })
      // console.log('user address',user);
      const result = await Address.updateOne(
        { "user_data": userId},
        { "$push": { "address": user } }
      );
        // console.log(result);
    }
    else{
      const address = ({
        name: newAddress.name,
        number: newAddress.number,
        houseAddress: newAddress.houseadd,
        city: newAddress.city,
        street: newAddress.street,
        pin: newAddress.pin,
    })
    // const userSave = await user.save()
    const userData = new Address({
      user_data:userId,  
      address: [address]  
    });
 
    userData.save()
    // console.log('user saved')
    }
      return true
  }catch(error){
    throw new Error(error.message)
  }
}


//EDIT THE EXISTING ADDRESS 
editAddressHelper = async (newAddress, userId) => {
  try{
    // console.log('edit Address helper');
    const user =({
      name: newAddress.name,
      number: newAddress.number,
      houseAddress: newAddress.houseadd,
      city: newAddress.city,
      street: newAddress.street,
      pin: newAddress.pin,
    })
    const index = newAddress.index
    // console.log('index',index);
    const result = await Address.updateOne(
      {
        "user_data": userId
      },
      {
        "$set": {
          [`address.${index}`]: user
        }
      }
    );
    // console.log(result);
      return true
  }catch(error){
    throw new Error(error.message)
  }
}


deleteAddressHelper = async (id, userId) =>{
  // console.log('user id',userId);
  const deleteobj = await Address.updateOne(
    { user_data: userId }, // Match the user based on the user ID
    { $pull: { address: { _id: new mongoose.Types.ObjectId(id) } } } // Remove the object with matching _id from addresses array
  );

  // console.log('result',deleteobj);
}


module.exports={

    getAddressDetails,
    addNewAddressHelper,
    editAddressHelper,
    deleteAddressHelper
}