const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../../Models/tourModel");
const User = require("../../Models/userModel");
const Review = require("../../Models/reviewModel");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });


//const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
const DB  = process.env.DATABASE_LOCAL;

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=>{console.log("DB connection is successfull!")});

// import file data

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,"utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,"utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,"utf-8"));

// insert the imported data into DB

const importData = async()=>{
    try{
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false});
        await Review.create(reviews);
        console.log("Data added suceesfully");
    } catch(err){
        console.log(err);
    }
    process.exit();
}

// delete all the data in DB

const deleteData = async()=>{
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data deleted successfully");
    } catch(err){
        console.log(err);
    }
    process.exit();
}   

if(process.argv[2] === "__import"){
    importData();
} else if(process.argv[2] === "__delete"){
    deleteData();
}
console.log(process.argv);