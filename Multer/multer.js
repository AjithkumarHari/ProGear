const multer = require('multer')
const path = require('path');


const addBanner = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../Public/banner-images"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const editBanner = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../Public/banner-images"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });


  const editProductImage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,  path.join(__dirname, "../Public/product-images"));
    },
    filename: (req, file, cb) => {
      cb(null,  Date.now() + "-" + file.originalname);
    },
  });
  

module.exports={
    addBannerupload: multer({ storage: addBanner }).single("image"),
    editBannerupload: multer({ storage: editBanner }).single("bimage"),
    editProduct: multer({ storage: editProductImage }).fields([
      { name: "image1", maxCount: 1 },
      { name: "image2", maxCount: 2 },
    ]),
    
}   