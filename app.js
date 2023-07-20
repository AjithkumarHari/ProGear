const express = require('express')
const app  = express()
const path = require('path');
require('dotenv/config')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log('Connected');
    })
    .catch(()=>{
        console.log('Not Connected');
    })

const userRouter = require("./Router/usersRouter")
const adminRouter = require("./Router/adminRouter")

app.set('view engine','ejs')

app.use(express.json())

app.use(express.static(path.join(__dirname, 'Public')));

app.use('/',userRouter)
app.use('/admin',adminRouter)

const port = process.env.PORT

app.listen(port, () =>{
    console.log(`App running on ${port}`);
}) 