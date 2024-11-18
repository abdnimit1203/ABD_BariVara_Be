// Basic Lib Import
const express =require('express');
const commonRouter = require('./src/routes/commonApi')
const app= new express();
const bodyParser =require('body-parser');
require('dotenv').config()

// Security Middleware Lib Import
const rateLimit =require('express-rate-limit');
const mongoSanitize =require('express-mongo-sanitize');
const xss =require('xss-clean');
const hpp =require('hpp');
const cors =require('cors');

// Database Lib Import
const mongoose =require('mongoose');

// Security Middleware Implement
app.use(cors())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
// Body Parser Implement
app.use(bodyParser.json())

// Request Rate Limit
const limiter= rateLimit({windowMs:15*60*1000,max:3000})
app.use(limiter)

// Mongo DB Database Connection
mongoose
    .set('strictQuery',false)
    .connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('Connected to DB')
    })
    .catch((err)=>{
        console.log(err.message)
    });

// Routing Implement
app.use("/api/v1",commonRouter)

app.get('/', (req, res) => {
    res.send('server is running!');
});

// Undefined Route Implement
app.use("*",(req,res)=>{
    res.status(404).json({status:"fail",data:"Not Found"})
})

module.exports=app;