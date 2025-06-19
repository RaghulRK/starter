const mongoose = require('mongoose');
const Tour = require("../Models/tourModel");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Cannot be empty"],

    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review cannot be empty']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: "tour",
    //     select: "name"
    // })
    
    this.populate({
            path:"user",
            select: 'name photo'
        })
    next();
})
reviewSchema.statics.calculateAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        nAvgRating: { $avg: '$rating' },
      }
    }
  ]);
  if(stats.length > 0 ){
    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].nAvgRating,
        ratingsQuantity: stats[0].nRating,
      });
  }else {
    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 4.5,
        ratingsQuantity: 0,
      });
  }
};

// compund index used to prevent duplicate reviews as one user can one review on a tour
reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  { unique: true },
);
// findbyidupdate and delete has access only to query middleware, hence get the data from
// of tourid from pre query middleware save to query middleware and run the statitics after
// review is created with post query middleware



reviewSchema.post('save',function(){
    this.constructor.calculateAverageRating(this.tour);
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calculateAverageRating(this.r.tour);
})
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;