const AppError = require("../Utils/appError");
const Tour = require("./../Models/tourModel");
const catchasync = require("./../Utils/catchAsync");
const factory = require("./handlerFactory");
// const APIFeatures = require("./../Utils/apiFeatures");


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

