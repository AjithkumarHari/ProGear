const express = require('express')
const app  = express()
const path = require('path');

const userRouter = require("./Router/usersRouter")
const adminRouter = require("./Router/adminRouter")


app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')));

 
app.use('/',userRouter)
app.use('/admin',adminRouter)


module.exports = app   