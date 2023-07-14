const jwt = require('jsonwebtoken')
const userData = require('../Model/userModel')


require('dotenv').config();

const authenticate = (req,res,next)=>{
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, 'secret_key',(err, decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }
            else{
                // console.log(decodedToken);
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
    // console.log("token :",token )

    if(token){
        jwt.verify(token, 'secret_key', async (err, decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null
                next()
            }
            else{
                // console.log(decodedToken);
                let user = await userData.findById(decodedToken.id)
                // console.log(user);
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
        jwt.verify(token,'secret_key', async (err, decodedToken) => {
            const user = await userData.findById(decodedToken.id);
            if (user.is_blocked==true){
              res.clearCookie('jwt')
              res.render('blocked')
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