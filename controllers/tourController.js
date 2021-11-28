const featuresApi = require("../utils/featuresApi");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const customError = require("../utils/customError");

class TourController {
    getAllTour() {
        return catchAsync(async (req, res) => {
            const newFeaturesApi = new featuresApi(Tour, req.query);
            const queryStr = newFeaturesApi.searchByTour().projecting().sort().paginate().execute();
            const tours = await queryStr;

            res.json({
                status: "success",
                results: tours.length,
                data: {
                    tours,
                },
            });
        });
    }

    getTourById() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const tour = await Tour.findById(id).populate("reviews");

            if (!tour) {
                throw new customError(`No tour with this id: ${id}`, 404);
            }

            res.json({
                status: "success",
                data: {
                    tour,
                },
            });
        });
    }

    getTourStats() {
        return catchAsync(async (req, res) => {
            const stats = await Tour.aggregate([
                {
                    $match: { ratingsAverage: { $gte: 4.5 } },
                },
                {
                    $group: {
                        _id: { $toUpper: "$difficulty" },
                        numTours: { $sum: 1 },
                        numRatings: { $sum: "$ratingsQuantity" },
                        avgRatings: { $avg: "$ratingsAverage" },
                        avgPrice: { $avg: "$price" },
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" },
                    },
                },
                {
                    $sort: { avgPrice: 1 },
                },
                // {
                //     $match: { _id: { $ne: "EASY" } },
                // },
            ]);

            res.json({
                status: "success",
                data: {
                    stats,
                },
            });
        });
    }

    getMonthlyPlan() {
        return catchAsync(async (req, res) => {
            const year = +req.params.year || new Date().getFullYear();

            const plan = await Tour.aggregate([
                {
                    $unwind: "$startDates",
                },
                {
                    $match: {
                        startDates: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$startDates" },
                        numTourStarts: { $sum: 1 },
                        tours: { $push: "$name" },
                    },
                },
                {
                    $addFields: { month: "$_id" },
                },
                {
                    $project: {
                        _id: 0,
                    },
                },
                {
                    $sort: { numTourStarts: -1 },
                },
            ]);

            res.json({
                status: "success",
                data: {
                    plan,
                },
            });
        });
    }

    createTour() {
        return catchAsync(async (req, res) => {
            const newTour = await Tour.create(req.body);
            res.status(201).json({
                status: "success",
                data: {
                    newTour,
                },
            });
        });
    }

    updateTour() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const tour = await Tour.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!tour) {
                throw new customError(`No tour with this id: ${id}`, 404);
            }

            res.json({
                status: "success",
                data: {
                    tour,
                },
            });
        });
    }

    deleteTour() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const tour = await Tour.findByIdAndDelete(id);

            if (!tour) {
                throw new customError(`No tour with this id: ${id}`, 404);
            }

            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }

    getToursWithin() {
        return catchAsync(async (req, res) => {
            const { distance, latlng, unit } = req.params;
            const [lat, lng] = latlng.split(",");
            const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

            if (!lat || !lng) {
                throw new customError(
                    "Please provide latitude and longitude int he format lat, lng.",
                    400
                );
            }

            const tours = await Tour.find({
                startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
            });

            res.json({
                status: "success",
                results: tours.length,
                data: {
                    tours,
                },
            });
        });
    }

    getDistances() {
        return catchAsync(async (req, res) => {
            const { latlng, unit } = req.params;
            const [lat, lng] = latlng.split(",");

            const multiplier = unit === "mi" ? 0.000621371192 : 0.001;

            if (!lat || !lng) {
                throw new customError(
                    "Please provide latitude and longitude int he format lat, lng.",
                    400
                );
            }

            const distances = await Tour.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [+lng, +lat],
                        },
                        key: "startLocation",
                        distanceField: "distance",
                        distanceMultiplier: multiplier,
                    },
                },
                {
                    $project: {
                        distance: 1,
                        name: 1,
                    },
                },
            ]);

            res.json({
                status: "success",
                results: distances.length,
                data: {
                    distances,
                },
            });
        });
    }
}

module.exports = new TourController();

// module.exports.checkValidId = (req, res, next, param) => {
//     const id = +param;
//     if (isNaN(id) || id < 1 || id > tours.length) {
//         return res.status(404).json({
//             status: "error",
//             message: "Not found",
//         });
//     }
//     next();
// };
