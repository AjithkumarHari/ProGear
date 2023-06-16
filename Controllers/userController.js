const bcrypt = require("bcrypt")
const _  = require("lodash")
const axios = require("axios")
const otpGenerator = require("otp-generator")
const jwt = require('jsonwebtoken')

const userData = require("../Model/userModel")
const productData = require("../Model/productModel")


module.exports.homePage = async ( req, res ) => {
    try{
        const product = await productData.find({ })
        res.render('landing',{product : product})
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
    
    
}


//***************************************************************  PRODUCT PAGE  *******************************************************//


module.exports.productPage = async ( req, res ) => {
    try{
        const id = req.query.productId
        console.log('id', id);
        const product = await productData.findOne({ _id : id }).populate('category')
        res.render('product',{product : product})
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
    
    
}


//***************************************************************  CART PAGE  *******************************************************//

module.exports.cartPage = async ( req, res ) => {
    try{
        const product = await productData.find({ })
        res.render('cart',{product : product})
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
    
    
}

//***************************************************************  CHECKOUT PAGE  *******************************************************//

module.exports.checkoutPage = async ( req, res ) => {
    try{
        const product = await productData.find({ })
        res.render('checkout',{product : product})
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
    }
    
    
}

//***************************************************************  Helper Functions  *******************************************************//

const maxAge = 3* 24* 60 * 60

const createToken = (id) => {
    return jwt.sign({id}, 'secret_key', { expiresIn : maxAge })
}




//****************************************************************  LOG_IN  *******************************************************//

//GET
module.exports.loginPage = async (req, res) =>{
    console.log("login page")
    res.render('login',{ title : 'LogIn'})
}

//POST
module.exports.loginVerify = async (req,res) =>{
    try{
        console.log('/login-POST');
        console.log(req.body.email);
        console.log(req.body.password);
        const userDetails = await userData.findOne({email : req.body.email})

            if(userDetails){
                if(userDetails.password==req.body.password){
                    if(userDetails.is_blocked){
                        res.render('blocked')
                    }
                    else{
                        const product = await productData.find({ })
                        res.render('landing',{product : product})
                        console.log('show landing page');
                    
                        //Create Token and Sending it as cookie
                        const token = createToken(userDetails._id)
                        res.cookie('jwt',token, {httpOnly: true, maxAge : maxAge*1000 })
                        console.log('token created');
                    }
                }
                else{
                    res.render('login',{message:'password incorrect'})
                    console.log('password incorrect');
                }
            }
            else{
                res.render('login',{message : 'incorrect email Id'})
                console.log('incorrect email Id');
            }
    }
    catch(error){
        res.send(error.message)
    }
}


//**********************************************************  FORGOT PASSWORD  **************************************************************//


//GET FORGOT PASSWORD
module.exports.forgotPasswordNum = async (req, res) => {
    res.render('forgotPasswordNum')
    console.log("GET - forgotPasswordNum");
}


//POST FORGOT PASSWORD [NUM]
module.exports.forgotPasswordOtp = async (req, res) => {
    
    console.log('forget password');        
    const user = await userData.findOne({number : req.body.number})
    console.log('',user);

    if(!user){
        res.render('forgotPasswordNum',{message:"User Not Found"})
    }
    else{

        //generate otp
        const OTP = otpGenerator.generate(6,{
            lowerCaseAlphabets: false, 
            upperCaseAlphabets: false, 
            specialChars: false
        })
        console.log(OTP)                                      

        // req.session.number = number
        req.session.otp = OTP
        req.session.email = user.email
        req.session.number = user.number

        console.log("user email",req.session.email);
        //renderin page
        res.render('forgotPasswordOtp')
    }
}

//POST FORGOT PASSWORD [OTP]

module.exports.fpOtpVerify = async (req,res)  => {
    try{
        const number = req.session.number
        console.log("otp number",number);
        const otp = req.session.otp
        console.log('session otp',otp);
        // res.send('welcome',)
        const reqOtp = req.body.otp

        const otpHolder = await userData.findOne({ number : req.body.number })
        console.log('otp holder',otpHolder);
        if(otp==reqOtp){
            //sending token as a cookie
            const token = createToken(userData._id)
            res.cookie('jwt',token, {httpOnly: true, maxAge : maxAge*1000 })
            res.render('setNewPassword')
    
        }
        else{
            return console.log("Your OTP was Wrong")
        }
    }
    catch(error){
        console.log(error);
        return console.log("an error occured");
    }
}

//POST RESET-PASSWORD

module.exports.setNewPassword = async (req ,res) => {
    const newpw = req.body.newpassword
    const confpw = req.body.confpassword

    const email = req.session.email

    console.log("np :",newpw," cp :",confpw,"\nemail: ",email);
    
    if(newpw === confpw){
        const updated = await userData.updateOne({ email : email }, { $set: { password: newpw } });
        console.log(updated);
        res.redirect('/')
        console.log('Password updated successfully');
    }
}

//*********************************************************  SIGN_UP  ************************************************************//

//GET
module.exports.signupPage = async (req,res) =>{
    res.render('signup',{title : "Signup"})                         
}

//POST
module.exports.signupAction = async (req,res) =>{

    console.log('/signup-POST');

    //storing user data in session
    const data = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        number:req.body.number,
     }
     req.session.userData = data
     console.log('data : \n',req.session.userData);

     //OTP Genetation
     const OTP = otpGenerator.generate(6,{
        lowerCaseAlphabets: false, 
        upperCaseAlphabets: false, 
        specialChars: false
    })
    console.log(OTP)

    //sending message
    // await client.messages.create({
    // body: `Your OTP for Sign Up is: ${OTP}`,
    // from: '+13613488421',
    // to: '+91 73064 46815',
    //  })

    req.session.otp = OTP
    req.session.number = req.body.number
    console.log('session otp',req.session.otp);
    console.log('session number',req.session.number);

    res.render('signupOtp', { countdown: 60 })
}

//OTP POST
module.exports.verifySignupOtp = async (req,res) =>{
    try{
         const userOtp = req.body.otp
        const newUser = req.session.userData;
    
        sessionOtp = req.session.otp
        console.log('session otp on verify',req.session.otp);
        if (!sessionOtp || !newUser) {
            res.send('Invalid Session');
        }else if (sessionOtp !== userOtp) {
          res.send('Invalid OTP');
        }else{
    
            const user = new userData({
                fname:newUser.fname,
                lname:newUser.lname,
                email:newUser.email,
                password:newUser.password,
                number:newUser.number
            })
            const userSave = await user.save()
            console.log('user saved');
            if(userSave){
    
                //creating sending token as a cookie
                const token = createToken(userData._id)
                res.cookie('jwt',token, {httpOnly: true, maxAge : maxAge*1000 })
                res.render('landing')
            }
            else{
                return console.log("Your OTP was Wrong")
            }
        } 
    }catch(error){
        console.log(error);
        return console.log("an error occured");
    }
}

//*********************************************************  RESEND OTP  ************************************************************//

module.exports.resendLoginOtp = async (req, res) => {
    const OTP = otpGenerator.generate(6,{
        lowerCaseAlphabets: false, 
        upperCaseAlphabets: false, 
        specialChars: false
    })
    console.log(OTP)

    req.session.otp = OTP
    res.render('forgotPasswordOtp')
}

module.exports.resendSignupOtp = async (req, res) => {
    const OTP = otpGenerator.generate(6,{
        lowerCaseAlphabets: false, 
        upperCaseAlphabets: false, 
        specialChars: false
    })
    console.log(OTP)

    req.session.otp = OTP
    res.render('signupOtp')
}

//*********************************************************  LOG_OUT  ************************************************************//

module.exports.logout = (req,res) =>{
    res.cookie('jwt', '' ,{maxAge : 1})
    console.log("token destroyed");
    res.redirect('/')
}
