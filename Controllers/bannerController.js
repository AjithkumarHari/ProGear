
const bannerHelper = require('../Helper/bannerHelper')


module.exports.bannerList = async(req,res)=>{

    try{
        bannerHelper.bannerListHelper().then((response)=> {

            // console.log('banners',response);

            res.render('bannerManagement',{banners:response})

        })
        
    }
    catch(error){
        console.log(error);
    }
}

module.exports.addBannerGet = async(req,res)=>{
    try{
        res.render('addBanner')
    }
    catch(error){
        console.log(error);
    }
}

module.exports.addBannerPost = async(req,res)=>{
    console.log("addBannerPost");
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        // console.log('res',response);
        if (response) {
            res.redirect("/admin/banner");
        } else {
            res.status(505);
        }
    });
}

module.exports.deleteBanner = async(req,res)=>{
    bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/banner")
    });
}

module.exports.editBanner=(req, res) => {

    bannerHelper.editBannerHelper(req.query.id).then((response) => {
        res.render("updateBanner",{banner:response});
    });
}


///update product list

module.exports.updateBanner = async (req, res) => {
    try {
        
    bannerHelper.updateBannerHelper(req.body, req?.file?.filename).then(( response) => {
        // console.log('res',response);
        if (response) {
            res.redirect("/admin/banner");
        } else {
            res.status(505);
        }
    });}
  catch (error) {
    console.log(error.message);
  }

}