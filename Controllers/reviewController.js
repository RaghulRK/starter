const catchasync = require("./../Utils/catchAsync");
// const AppError = require("./../Utils/appError");
const Review = require("./../Models/reviewModel");
const factory = require("./handlerFactory");



exports.setTourUserId = (req,res,next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);

// Do not update the password
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);