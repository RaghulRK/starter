//creating a schema using mongoose 
const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require('validator');
//const User = require("./userModel"); // embedding
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: ['true', "A tour name should be given"],
        unique: true,
        maxlength: [40, 'A tour name must have only 40 characters'],
        minlength: [10, ' A tour muust have minimum characters'],
        // below custom validator from third party
        //validate : [validator.isAlpha, "Tour name must only contain character"]
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy, difficult and ,medium'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, ' Rating must be greater than 1'],
        max: [5, 'Rating must be below 5'],
        set: val=> Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: "Discount price ({VALUE}) should not be greater than price amount",
            validator: function (val) {
                // this variable point only to current document of new document being created, not for update one 
                return val < this.price;
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    price: {
        type: Number,
        required: true
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON data quite different from normal schema defintion which is called schemes types
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: ['Point'],
                enum: ['Point']
            },
            coordinates: [Number],
            description: String,
            address: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
    // guides: Array
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// create the index for the price field, it will be create the index in db, so that document will scan for the price field intially by ascending ( 1 ) and return data 
tourSchema.index({
    price : 1
})

// create a compound index
tourSchema.index({
    price: 1, ratingsAverage: -1
})

tourSchema.index({ slug : 1});

tourSchema.index({
    startLocation:'2dsphere'
})
// creating index is based on how often read is done, and relevant data is accessed
// virtual properties defined for a schema which will not be saved to db, instead useful for application level;
tourSchema.virtual('durationWeeks').get(function () {
    this.duration / 7;
})

// DOCUMENT middleware for Mongo db, there is two pre and post.
// runs before save() or create() function on db operation
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// virtual populate, instead of using the child referecing using the virtual populate, which acts like a parent referencing, tour does not know anything about reviews and also review does not anything about the parent in review model
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField : 'tour',
    localField: '_id'
})
// tourSchema.pre('save', async function(next){
//     const guidesData = this.guides.map( async id => await User.findById(id));
//     this.guides = await Promise.all(guidesData);
//     next();
// }) // embedding

//post document middleware

tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
})

//Query Middleware

tourSchema.pre(/^find/, function(next){
    this.populate({
            path: "guides",
            select: "-__v -passwordChangedAt"
        });
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Time took to execute is ${Date.now() - this.start}`);
    //console.log(docs);
    next();
})

// AGGREATE MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match: {
//             secretTour: { $ne: true }
//         }
//     })
//     console.log(this.pipeline());
//     next();
// })
// creating a model

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;