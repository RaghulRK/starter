const User = require("./../Models/userModel");
const catchasync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/appError");
const factory = require("./handlerFactory");


const filterObj = (obj,...allowedFields) =>{
    let newObj = {};
    Object.keys(obj).forEach((el) => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el]
        }
    })
    return newObj;
}
exports.updateMe = catchasync(async(req,res,next) => {
    // 1 check if user tries to update password and throw error
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError("This route is not for password update!!", 400));
    }

    // 2 filter the body by resticting to update only the required fields to updated in DB
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3 update using findbyIDandUpdate as here we are not updating the password\
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    // 4update the data and send the response
    res.status(200).json({
        status: "Success",
        data:{
            user: updatedUser
        }
    })
});
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };
exports.deleteMe = catchasync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    })
    res.status(204).json({
        status: "Success",
        data: null
    })
});

exports.createuser = ((req, res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not yet defined, Please use /signup"
    })
})

exports.getallusers = factory.getAll(User);
exports.getuser = factory.getOne(User);

// do not update the password
exports.updateuser = factory.updateOne(User);
exports.deleteuser = factory.deleteOne(User);


