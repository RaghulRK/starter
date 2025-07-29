const catchAsync = require("./catchAsync");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utilis/appError");
const multer = require('multer');
const sharp = require('sharp');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const sendUserToken = (user,statusCode, req, res) => {
  const jwtToken = signToken(user._id);
  res.cookie('jwt', jwtToken, {
    expiresIn : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 24 * 60 * 60 * 1000),
    httpOnly: true
  });

    user.password = undefined;
    user.passwordChangedAt = undefined
    res.status(statusCode).json({
        status: "success",
        jwtToken,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {
 const userData =  {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  }
  if(req.file){
    userData.photo = req.file.filename;
  }
  const newUser = await User.create(userData);
  sendUserToken(newUser, 201,req, res);
});

exports.login = catchAsync(async(req,res,next) => {
  // 1) check if the recived email and password is empty or not

  const { email, password} = req.body;

  if(!email || !password) {
    return next(new AppError("please provide email or password", 404));
  }
  // 2)check if the user is present for the email ID and check the given password is correct
  const user = await User.findOne({email}).select("+password");
  if(!user || !( await user.checkPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 404));
  }
  // 3) generate token and send it to the user for login
  sendUserToken(user, 200, req, res);
})

// create the memory where file to stored temporarly and file format for which the file to uploaded
const multerstorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file format", 400), false);
  }
}
const upload = multer({
  storage: multerstorage,
  fileFilter : multerFilter
})

exports.uploadPhoto = upload.single('photo');

exports.resizeImage = catchAsync(async(req,res,next) => {
    if(!req.file) return next();

    req.file.filename = `userimage${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
});
// above is single image upload for a field
// exports.uploadPhoto = upload.array('photo', 4);
// above for single field with multiple images
// upload.fields[{
// name: "photo", maxcount: 3}]
// above for multiple fields with multiple images