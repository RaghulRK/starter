const AppError = require("../Utils/appError");
const Tour = require("./../Models/tourModel");
const catchasync = require("./../Utils/catchAsync");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require('sharp');
// const APIFeatures = require("./../Utils/apiFeatures");

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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount:3}
])

// for single upload.single('photo')
// for single with multiple image upload.array('images',5);
// for mix and match above one

exports.resizeTourImages = catchasync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    // update imagecover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // upload images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    )
    next();
})
// alias routing by setting predefined query parameter values
exports.aliasRoute = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "_ratingsAverage,price";
    req.query.field = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// removed try and catch to remove repepated code and handling in common way by function a and pass async function as paramter
exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getindividualtour = factory.getOne(Tour, { path: "reviews"});

// Do not update the password
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStatus = catchasync(async (req, res, next) => {
    const getagg = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 }
            }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                avgPrice: { $sum: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                numTours: { $sum: 1 }
            }
        }, {
            $sort: { avgPrice: -1 }
        }
        // ,{
        //     $match : {
        //         _id : { $ne : "EASY"}
        //     }
        // }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            getagg
        }
    })
})
exports.getMonthlyPlans = catchasync(async (req, res, next) => {
    const year = req.params.year * 1;
    const aggData = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            aggData
        }
    })
})

exports.getToursWithin = catchasync(async(req,res,next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    if(!lat || !lng) {
        next(new AppError("Please specify the lat and long in this manner", 400));
    }
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation : {
            $geoWithin :{
                $centerSphere : [
                    [lng,lat], radius
                ]
            }
        }
    });
    res.status(200).json({
        status: "success",
        results: tours.length,
        data :{
            tours
        } 
    })
});

exports.getToursDistances = catchasync(async (req,res,next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    if(!lat || !lng) {
        next(new AppError("Please specify the lat and long in this manner", 400));
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

     // for geo aggregate queries first stage should ne neowithin and start with near, and there should be geospacial field defined with index to it

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },{  // project stage to display only required fields in output results
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        results: distances.length,
        data :{
            distances
        } 
    })
});


//commented code

// const fs = require("fs");
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
// exports.checkID = (req,res,next,val) =>{
//     console.log(`${val} this is the val of id in param middleware`);
//     if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//         status: "fail",
//         message: "Invalid ID"
//     })
// }
// next();
// }

// exports.checkpostTourMiddleware = (req,res,next) =>{
//     console.log("hello from my own middleware");
//     const value = req.body;
//     if(value.name === "" && value .difficulty === ""){
//         return res.status(404).json({
//             status: "fail",
//             message: "invalid id"
//         })
//     }
//     next();
// }
//create tour
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// fs.writeFile((`${__dirname}/dev-data/data/tours-simple.json`), JSON.stringify(tours), err => {
//     res.status(201).json({
//         status: "success",
//         data: {
//             tour: newTour
//         }
//     })
// })

