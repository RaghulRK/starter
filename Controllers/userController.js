const User = require("./../Models/userModel");
const catchasync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/appError");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require('sharp');
// const upload  = multer({ dest: "public/js/users"});

// // define the storage and filename locally 
// const multerStorage = multer.diskStorage({
//     destination:(req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req,file,cb)=>{
//         const ext = file.mimetype.split["/"][1];
//         cb(null,`User-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

// another way of handling the storage of images is memory storage

const multerStorage = multer.memoryStorage();

// filter by checking only uploadin the jpeg images only
const multerfilter=(req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    } else {
        cb(new AppError("image is not proper, please upload only image", 400),false);
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter:multerfilter
});

const filterObj = (obj,...allowedFields) =>{
    let newObj = {};
    Object.keys(obj).forEach((el) => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el]
        }
    })
    return newObj;
}
exports.UploadPhoto = upload.single('photo');
exports.resizeuserphoto = (req, res,next)=> {
    if(!req.file) return next();
    
    req.file.filename = `User-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    
    next();
}
exports.updateMe = catchasync(async(req,res,next) => {
    // 1 check if user tries to update password and throw error
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError("This route is not for password update!!", 400));
    }

    // 2 filter the body by resticting to update only the required fields to updated in DB
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;

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


