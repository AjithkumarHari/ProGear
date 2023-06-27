const orderData = require('../Model/orderModel')
// const adderssData = require('../Model/adderssModel')

// //POST
module.exports.checkout = async (req,res) =>{
    try{


        // console.log('checkout post');
        const {payment_method , address} = req.body;
        const user = res.locals.user.id
        console.log(
            'checkout post',payment_method,
            "user id",user,
            "address", address
        );
        // const  user = res.locals.user
        // console.log(user);
        // const details = new adderssData({
        //     user_data: user.id, // Assuming you have a user_data field in req.body with the ObjectId value
        //     address: [{adderss_1 : add1,adderss_2 : add2,city : city,pin : pin}]
        //     });


        //     const deliveryAddress = ({
        //         name: req.body.name,
        //         number: req.body.number,
        //         houseAddress: req.body.houseadd,
        //         city: req.body.city,
        //         street: req.body.street,
        //         pin: req.body.pin,
        //     })
        //     // const userSave = await user.save()
        //     const userData = new Address({
        //       user_data:userId,  
        //       address: [address]  
        //     });
        
        //     userData.save()
        //     console.log('user saved')
            
        //     details.save()
        //     .then(() => {
        //         res.redirect('/landing');
        //     })
        //     .catch((err) => {
        //         console.error("Error adding product:", err);
        //         res.status(500).send("Error adding product to the database");
        //     });
        // console.log(details);
        res.send('form submit')
    } catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
}

