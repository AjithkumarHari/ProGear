const couponHelper = require('../Helper/couponHelper')
const Coupon = require('../Model/couponModel')

//GET
module.exports.couponList = async(req,res)=>{
    try {
        const couponList = await Coupon.find()
        res.render('couponManagement',{couponList})
    } catch (error) {
        console.log("Error from couponList", error);
        res.redirect("/error-500");
    }
}


//GET
module.exports.loadCouponAdd = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log("Error from loadCouponAdd", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.generateCouponCode = (req,res)=>{ 
    try{
        couponHelper.generatorCouponCode().then((couponCode) => { 
            res.send(couponCode);
        });
    }catch (error) {
        console.log("Error from generateCouponCode", error);
        res.redirect("/error-500");
    }
}

//POST
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
        couponHelper.addCoupon(data).then((response) => {
            res.redirect('/admin/coupon')
        });
    } catch (error) {
        console.log("Error from addCoupon", error);
        res.redirect("/error-500");
    }
}
 
//POST
module.exports.removeCoupon = async(req,res)=>{
    try {
        const id = req.body.id
        await Coupon.deleteOne({_id:id})
        res.json({status:true})
    } catch (error) {
        console.log("Error from removeCoupon", error);
        res.redirect("/error-500"); 
    }
}