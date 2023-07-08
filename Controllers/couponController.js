const couponHelper = require('../Helper/couponHelper')
const Coupon = require('../Model/couponModel')

//GET
module.exports.couponList = async(req,res)=>{
    try {
        const couponList = await Coupon.find()
        console.log("couponList",couponList);
        res.render('couponManagement',{couponList})
    } catch (error) {
        
    }
}


//GET
module.exports.loadCouponAdd = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports.generateCouponCode = (req,res)=>{
    couponHelper.generatorCouponCode().then((couponCode) => { 
        res.send(couponCode);
      });
}


module.exports.addCoupon =  (req, res) => {
    try {
        const {couponCode,validity,minPurchase,minDiscountPercentage,maxDiscountValue,description} = req.body
        
        const data = {
            couponCode,
            validity,
            minPurchase,
            minDiscountPercentage,
            maxDiscountValue,
            description,
          };
          console.log("data",data);

          couponHelper.addCoupon(data).then((response) => {
            res.redirect('/admin/coupon')
          });
        
    } catch (error) {
        console.log(error.message);
        
        
    }
   
  }


 
module.exports.removeCoupon = async(req,res)=>{
    try {
        const id = req.body.couponId
        await Coupon.deleteOne({_id:id})
        res.json({status:true})
        
    } catch (error) {
        
    }
}
