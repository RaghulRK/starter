require('dotenv-flow').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Users service connected successfully!");
}).catch((err) => {
    console.log(`Mongo DB connection error: ${err}`);
})

const PORT = process.env.PORT || 4003;
app.listen(PORT,()=>{
    console.log(`User service running on port:${PORT}`);
})