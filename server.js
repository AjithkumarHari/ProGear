require('dotenv/config')
// const mongoose = require('mongoose')
const app = require('./app')


    
const port = process.env.PORT || 3001

app.listen(port, () =>{
    console.log(`App running on ${port}`);
})