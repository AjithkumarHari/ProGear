// const orderData = require('../Model/orderModel')
// const adderssData = require('../Model/adderssModel')

// //POST
// module.exports.checkout = async (req,res) =>{
//     try{
//         const {add1, add2 , city,pin} = req.body;
//         const  user = res.locals.user
//         console.log(user);
//         const details = new adderssData({
//             user_data: user.id, // Assuming you have a user_data field in req.body with the ObjectId value
//             address: [{adderss_1 : add1,adderss_2 : add2,city : city,pin : pin}]
//             });
            
//             details.save()
//             .then(() => {
//                 res.redirect('/landing');
//             })
//             .catch((err) => {
//                 console.error("Error adding product:", err);
//                 res.status(500).send("Error adding product to the database");
//             });
//         console.log(details);
//         res.send('form submit')
//     } catch(error){
//         console.log(error);
//         res.send({ success: false, error: error.message });
//     }
// }