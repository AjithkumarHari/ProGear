const jwt = require('jsonwebtoken')
const adminData = require('../Model/adminModel')

const authenticate = (req,res,next)=>{
    const token = req.cookies.jwtAdmin
    if(token){
        jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY,(err, decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/admin')
            }
            else{
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
        jwt.verify(token, process.env.JWT_ADMIN_SECRET_KEY, async (err, decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null
                next()
            }
            else{
                let user = await adminData.findById(decodedToken.id)
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

module.exports = {
    authenticate,
    checkUser
}