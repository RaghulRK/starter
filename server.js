const dotenv = require("dotenv");
const mongoose = require("mongoose");

// below is the uncaught exception for sync functions or code and should be defined at first
process.on("uncaughtException", err => {
    console.log("uncaught expection!. so shutting down!!");
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({ path: "./config.env" });

//const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(()=>{console.log("DB connection is successfull!")});


// create a document from model instance and save it using instance default methods

// testTour.save().then((doc)=> {
//     console.log(doc);
// }).catch((err)=> {console.log(err)});
const app = require("./app");
//  
console.log(process.env.NODE_ENV);


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`${port} running on this port`);
});


/// below is the unhandlled rejection for async functions
process.on('unhandledRejection', err => {
    console.log("unhandled rejection so shutting down!!");
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    })
})