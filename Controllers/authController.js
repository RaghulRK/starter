const { promisify } = require('util');
const User = require("./../Models/userModel");
const catchAsync = require("./../Utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../Utils/appError");
const Email = require("./../Utils/email");
const crypto = require("crypto");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
const sendUserToken = (user, statusCode, res) =>{
    const token = signToken(user._id);
    const cookieOptions ={
        expiresIn: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    res.cookie('jwt', token,cookieOptions );
    if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
    
    // remove password fields from the res
    user.password = undefined;
    user.passwordChangedAt = undefined
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    sendUserToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //1 check values of email or password is not null or not given and throw error
    if (!email || !password) {
        return next(new AppError("Please provide email or password!", 400));
    }
    // 2 check if the user exists & password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // 3 generte the token and sent to the client
    sendUserToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1 check if the token is present in the API level
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError("User is not logged in, please login to access the app"), 401);
    }
    // 2 verify if the token is valid
    const decodedData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3 verify if the user still exists

    const freshUser = await User.findById(decodedData.id);

    if (!freshUser) {
        return next(new AppError("The token belonging to the user does not exists!", 401));
    }

    // 4 check if user has not changed the password after the token is generated
    if (freshUser.CheckPasswordChangedAfter(decodedData.iat)) {
        return next(new AppError("Password changed has been changed. Please login again!!", 401));
    }

    // Route is protected navigate to next
    req.user = freshUser; // pass data from one route to another
    res.locals.user = freshUser; // pass data to template of pug
    next();
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {

    // 1 check if the token is present in the API request 
    if (req.cookies.jwt) {
        try {
            // 2 verify if the token is valid
            const decodedData = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 3 verify if the user still exists
            const freshUser = await User.findById(decodedData.id);

            if (!freshUser) {
                return next();
            }

            // 4 check if user has not changed the password after the token is generated
            if (freshUser.CheckPasswordChangedAfter(decodedData.iat)) {
                return next();
            }

            // create locals to access the values in pug templates and he is a logged in user
            res.locals.user = freshUser;
            return next();
        } catch(err) {
            return next();
        }
    }
    next();
}
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You are not authrorized to access", 403));
        }
        next();
    }
}

exports.forgotpassword = catchAsync(async (req, res, next) => {
    // 1 check if its valid email is valid and present
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("Provide a validate email ID to reset", 404));
    }

    // 2 generate a random token using instance method
    const token = user.createPasswordResetToken();

    await user.save({
        validateBeforeSave: false
    })
    // save the pssword expire token and its expiring time, save the encrypted one in DB and plain to be sent to user via email

    // 3 send back the email with random token

    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${token}}`;
        await new Email(user, resetURL).sendResetPassword();
        res.status(200).json({
            status: "success",
            message: "Token is sent to email ID"
        })
    }
    catch{
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        })
        return next(new AppError("There was error sending the email. Please try again later", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1 get the token and check if the user is present or not

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken : hashedToken, passwordResetExpires : { $gt: Date.now()}
    })

    if(!user){
        return next(new AppError("invalid email or token is expired, please try again", 400));
    }

    // 2 save the updated password to db 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3 update the passwordchangedAt field 

    // 4 log the user and send the JWT token
    sendUserToken(user, 200, res);
});

exports.updatePassword = catchAsync( async(req,res,next) =>{
    // 1 get user collection from DB - no need to verify token as user is already logged in and tryin to reset the password
    const user = await User.findById(req.user.id).select("+password");

    // 2 verify user password is correct else throw error
    if(! (await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next( new AppError("Password is wrong", 401));
    }

    // 3 change the password and update to db
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4 send the JWT token 
    sendUserToken(user, 200, res);
})