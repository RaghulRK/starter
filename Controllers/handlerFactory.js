const AppError = require("./../Utils/appError");
const catchasync = require("./../Utils/catchAsync");
const APIFeatures = require("./../Utils/apiFeatures");


exports.createOne = Model => catchasync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})


exports.deleteOne = Model => catchasync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError("Could not document with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    }
    )
})

exports.updateOne = Model => catchasync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!doc){
        return next(new AppError("Could not doc with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    }
    )
})

exports.getOne = (Model, populateOptions) => catchasync(async (req, res, next) => {
    let query  = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if(!doc){
        return next(new AppError("Could not document with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    }
    )
})


exports.getAll = Model => catchasync(async (req, res, next) => {
    // hack added to add the review filter for logged in users
    let filterObj = {};
    if(req.params.tourId){
        filterObj = {
            tour: req.params.tourId
        }
    }
    // EXECUTE THE QUERY 
    const updatedQuery = new APIFeatures(Model.find(filterObj), req.query).filter().sort().limitFields().paginate();
    const docs = await updatedQuery.query;

    //const docs = await updatedQuery.query.explain();
    // above explain gives us the statics of the query execution

    // SEND THE RESPONSE
    res.status(200).json({
        status: "success",
        requestedAt: req.RequestTime,
        results: docs.length,
        data: {
            data: docs
        }
    })
    // 1st way of using query parameters
    // let query = Tour.find(updatedQuery);
    // 2nd way using mongo db drivers
    // const allData = await Tour.find().where("difficulty").equals("easy").where("duration").equals(5);
})