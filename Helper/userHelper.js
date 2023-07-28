const User = require('../Model/userModel');
const mongoose = require("mongoose");

const Razorpay = require('razorpay');
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.generateRazorpayForWallet=(userId,total)=>{
    total = parseInt(total);
    return new Promise(async(resolve,reject)=>{
        try {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + userId
              };
              console.log('it resacged here ',options);
              instance.orders.create(options, function (err, order) {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(order);
                }
              });
        } catch (error) {
            reject(error);
        }
    })
}


module.exports.verifyOnlinePayment= (paymentData) => {
    // console.log(paymentData);
    return new Promise((resolve, reject) => {
        try {
            const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification
            let razorpaySecretKey = process.env.RAZORPAY_KEY_SECRET;
            let hmac = crypto.createHmac('sha256', razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm
            hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']);
            // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response
            let serverGeneratedSignature = hmac.digest('hex');
            // Converted the final hashed result into hexa code and saving it as server generated signature
            let razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']
            if (serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient) {
                // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 
                console.log("Payment Signature Verified");
                resolve()
            } else {
                console.log("Payment Signature Verification Failed");
                reject()
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.rechargeUpdateWallet=(userId, referalAmount)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const user  = await User.findOne({_id:new mongoose.Types.ObjectId(userId)}).lean().exec()
            const  wallet = user.wallet
            if(wallet){
                const currentAmount = wallet
                const updatedAmount = currentAmount + referalAmount;
                const walletUpdate = await User.updateOne({_id:new mongoose.Types.ObjectId(userId)},{ $set: { wallet: updatedAmount } })
                resolve()
            }else{
                reject(new Error('Wallet not found'));
            }
        } catch (error) {
            reject(error);
        }
    })
}