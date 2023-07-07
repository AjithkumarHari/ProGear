const express = require('express')
const app  = express()
const path = require('path');
require('dotenv/config')

const userRouter = require("./Router/usersRouter")
const adminRouter = require("./Router/adminRouter")

app.set('view engine','ejs')

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')));

 
app.use('/',userRouter)
app.use('/admin',adminRouter)

const port = process.env.PORT || 3001

app.listen(port, () =>{
    console.log(`App running on ${port}`);
})
// module.exports = app   