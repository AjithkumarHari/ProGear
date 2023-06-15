require('dotenv/config')
const mongoose = require('mongoose')
const app = require('./app')

// mongoose.connect(process.env.MONGODB_URL_LOCAL, {
//     useNewurlParser : true,
//     useUnifiedTopology : true,
//     useCreateIndex : true
// })
//     .then(() => console.log("Connected to MongoDB"))
//     .catch((err) => console.log("MongoDB connection Failed"))

mongoose.connect("mongodb://0.0.0.0:27017/signup-otp")
    .then(() => {
        console.log("connected")
    })
    .catch(() =>{
        console.log("connection Failed")
    })

    
const port = process.env.PORT || 3001

app.listen(port, () =>{
    console.log(`App running on ${port}`);
})