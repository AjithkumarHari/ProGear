const { loginPage } = require('../Controllers/userController');
const Banner = require('../Model/bannerModel')

const addBannerHelper=async(texts, Image) => {
    return new Promise(async (resolve, reject) => {
        console.log(texts, Image);
        const banner = new Banner({
            title: texts.title,
            description: texts.description,
            image: Image,
        });
        await banner.save().then((response) => {
            resolve(response);
        });
    });
}
const bannerListHelper = async()=>{
    return new Promise(async (resolve, reject) => {
        await Banner.find().then((response) => {
            resolve(response);
        });
    });
}

const deleteBannerHelper =async(deleteId)=>{
    try {
        return new Promise(async (resolve, reject) => {
            await Banner.deleteOne({ _id: deleteId }).then(() => {
                resolve();
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

const editBannerHelper = async(bannerId) =>{
    try {
        return new Promise((resolve, reject) => {
        Banner.findOne({ _id: bannerId }).then((response) => {
            resolve(response);
          });
        });
      } catch (error) {
        console.log(error.message);
      }
}
module.exports = {
    addBannerHelper,
    bannerListHelper,
    deleteBannerHelper,
    editBannerHelper

}