const cartData = require("../Model/cartModel");
const cartHelper = require("../Helper/cartHelper");
const Category = require("../Model/categoryModel");

//GET
module.exports.cartPage = async (req, res) => {
  try {
    const token = res.locals.user;
    const user = res.locals.user;
    const cart = await cartData.aggregate([
      {
        $match: {
          user_id: user.id,
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "products",
          localField: "product.product_id",
          foreignField: "_id",
          as: "carted",
        },
      },
      {
        $project: {
          item: "$product.product_id",
          quantity: "$product.quantity",
          user: "$user_id",
          carted: { $arrayElemAt: ["$carted", 0] },
          total: {
            $multiply: [
              "$product.quantity",
              { $arrayElemAt: ["$carted.price", 0] },
            ],
          },
        },
      },
    ]);
    let subtotal = 0;
    try {
      if (cart && cart.length > 0) {
        subtotal = cart.reduce((acc, item) => acc + item.total, 0);
      } else {
        throw new Error("Cart is empty or invalid.");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
    const category = await Category.find({ is_listed: true });
    if (cart == null) {
      res.render("cart", { cart: [], subtotal, category, token });
    } else {
      res.render("cart", { cart, subtotal, category, token });
    }
  } catch (error) {
    console.log("Error from cartPage", error);
    res.redirect("/error-500");
  }
};

//POST
module.exports.addToCart = async (req, res) => {
  try {
    if (res.locals.user != null) {
      cartHelper
        .addCart(req.params.id, res.locals.user.id, req.params.price)
        .then((response) => {
          res.send(response);
        });
    } else {
      res.send((response = null));
    }
  } catch (error) {
      console.log("Error from addToCart", error);
      res.redirect("/error-500");
  }
};

//POST
module.exports.removeFromCart = async (req, res) => {
  try {
    const user = res.locals.user.id;
    cartHelper.deleteProduct(req.body, user).then((response) => {
      res.send(response);
    });
  } catch (error) {
      console.log("Error from removeFromCart", error);
      res.redirect("/error-500");
  }
};

//POST
module.exports.changeItemQuantity = async (req, res) => {
  try {
    cartHelper.changeProductQuantity(req.body).then((response) => {
      res.send(response);
    });
  } catch (error) {
      console.log("Error from changeItemQuantity", error);
      res.redirect("/error-500");
  }
};