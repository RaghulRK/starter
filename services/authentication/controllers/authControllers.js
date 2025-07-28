const catchAsync = require("./catchAsync");
exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "User signed up"
  });
});