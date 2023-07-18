const bannerHelper = require('../Helper/bannerHelper')

//GET
module.exports.bannerList = async(req,res)=>{
    try{
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('bannerManagement',{banners:response})
        })
    }
    catch(error){
        console.log("Error from bannerList", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.addBannerGet = async(req,res)=>{
    try{
        res.render('addBanner')
    }catch(error){
        console.log("Error from addBannerGet", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.addBannerPost = async(req,res)=>{
    try{ 
        bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
            if (response) {
                res.redirect("/admin/banner");
            } else {
                res.status(505);
            }
        });
    }catch(error){
        console.log("Error from addBannerPost", error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.deleteBanner = async(req,res)=>{
    try{
        bannerHelper.deleteBannerHelper(req.body.id).then(() => {
            res.redirect("/admin/banner")
        });
    }catch(error){
        console.log("Error from deleteBanner", error);
        res.redirect("/error-500");
    }
}

//GET
module.exports.editBanner=(req, res) => {
    try{
        bannerHelper.editBannerHelper(req.query.id).then((response) => {
            res.render("updateBanner",{banner:response});
        });
    }catch(error){
        console.log("Error from editBanner",error);
        res.redirect("/error-500");
    }
}

//POST
module.exports.updateBanner = async (req, res) => {
    try {
        bannerHelper.updateBannerHelper(req.body, req?.file?.filename).then(( response) => {
            if (response) {
                res.redirect("/admin/banner");
            } else {
                res.status(505);
            }
        });
    }catch (error) {
        console.log("Error from updateBanner",error);
        res.redirect("/error-500");
    }
}