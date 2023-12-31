const jwt = require('jsonwebtoken')
const userData = require('../Model/userModel')
require('dotenv').config();

const authenticate = (req,res,next)=>{
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY,(err, decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }
            else{
                next()
            }
        })
    }
    else{
        res.redirect('/login')
    }
}

const checkUser =  (req,res,next) =>{
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token,  process.env.JWT_SECRET_KEY, async (err, decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null
                next()
            }
            else{
                let user = await userData.findById(decodedToken.id)
                res.locals.user = user
                next()
            }
        })
    }
    else{
        res.locals.user = null
        next()
    }
}

const checkBlocked =  (req,res,next)=> {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY , async (err, decodedToken) => {
            const user = await userData.findById(decodedToken.id);
            if (user.is_blocked==true){
              res.clearCookie('jwt')
              res.redirect("/error-403");
          }else{
              next()
          }
        });
    }else{
        next()
    }
}


module.exports = {
    authenticate,
    checkUser,
    checkBlocked
}