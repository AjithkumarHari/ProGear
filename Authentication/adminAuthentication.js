const jwt = require('jsonwebtoken')
const adminData = require('../Model/adminModel')


const authenticate = (req,res,next)=>{
    const token = req.cookies.jwtAdmin
    console.log('authenticate');
    if(token){
        jwt.verify(token, 'secret_key_admin',(err, decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/admin')
            }
            else{
                console.log(decodedToken);
                next()
            }
        })
    }
    else{
        res.redirect('/admin')
    }
}



const checkUser =  (req,res,next) =>{
    const token = req.cookies.jwtAdmin

    if(token){
        jwt.verify(token, 'secret_key_admin', async (err, decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null
                next()
            }
            else{
                // console.log(decodedToken);
                let user = await adminData.findById(decodedToken.id)
                res.locals.user = user
                next()
            }
        })
    }
    else{
        res.locals.admin = null
        next()
    }
}

module.exports = {
    authenticate,
    checkUser
}