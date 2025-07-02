const AppError = require("./../Utils/appError");
const sendDevError = (err, req, res) => {
    // A) Handle API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errStack: err.stack,
            error: err
        })
    }
    // B) Handle Rendering Pages
    return res.status(err.statusCode).render('error', {
        title: "something went wrong!",
        msg: err.message
    })
}
const sendProdError = (err, req, res) => {
    // 1) API error
    if (req.originalUrl.startsWith('/api')) {
        // all the operational errors are logged here
        if (err.operational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        // all the programmatic errors are logged here
        // first log the error and send a generic message to given to end users
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "somrthing went wrong here!"
        })
    }
    // 2) Rendering Error // operational and trusted error send to frontend
    if (err.operational) {
        //console.log(err);
        return res.status(err.statusCode).render('error', {
            title: "something went wrong!",
            msg: err.message
        })
    }
    // all the programmatic errors are logged here
    // first log the error and send a generic message to given to end users
    console.error(err);
    return res.status(err.statusCode).render('error', {
        title: "something went wrong!",
        msg: 'Please try again later'
    })
}
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);
}
const handleDuplicateErrorDB = (err) =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate value should not be given ${value}`;
    return new AppError(message, 400);
}
const handleValidationError = (err) =>{
    const errors = Object.values(err.errors).map( el => el.message);
    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
}
const handleJsonError =() => {
    return new AppError("Invalid JWT token", 401);
}
const handleJWTExpiredToken = () =>{
    return new AppError("Your token has been expired!. Please log in again!", 401);
}
module.exports = (err, req, res, next)=>{
    //console.log(err.stack); - track error from where did the error occurred
    err.statusCode = err.statusCode  || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === "development"){
        sendDevError(err, req, res);
    } else if( process.env.NODE_ENV === "production"){
        let error ={...err};
        error.message = err.message;
        if(err.name === "CastError"){
            error = handleCastErrorDB(error);
        }
        if(err.code === 11000){
            error = handleDuplicateErrorDB(error);
        }
        if(err.name === "ValidationError"){
            error = handleValidationError(error);
        }
        if(err.name === "JsonWebTokenError"){
            error = handleJsonError();
        }
        if(err.name == "TokenExpiredError"){
            error = handleJWTExpiredToken();
        }
        sendProdError(error, req,res);
    }
}