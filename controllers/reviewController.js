const featuresApi = require("../utils/featuresApi");
const catchAsync = require("../utils/catchAsync");
const customError = require("../utils/customError");
const Review = require("../models/reviewModel");

class ReviewController {
    getReviewByTour() {
        return catchAsync(async (req, res) => {
            const tour = req.params.tourId;

            const reviews = await Review.find({ tour });

            res.json({
                status: "success",
                data: {
                    reviews,
                },
            });
        });
    }

    getMyReviewByTour() {
        return catchAsync(async (req, res) => {
            const tour = req.params.tourId;
            const user = req.user._id;

            const review = await Review.findOne({ tour, user });

            res.json({
                status: "success",
                data: {
                    review,
                },
            });
        });
    }

    createReviewByTour() {
        return catchAsync(async (req, res) => {
            const tour = req.params.tourId;
            const user = req.user._id;

            const newReview = await Review.create({ ...req.body, tour, user });

            res.status(201).json({
                status: "success",
                data: {
                    newReview,
                },
            });
        });
    }

    updateReviewByTour() {
        return catchAsync(async (req, res) => {
            const tour = req.params.tourId;
            const user = req.user._id;

            if (!req.body.review && !req.body.rating) {
                throw new customError("Review or rating must be required", 400);
            }

            const newReview = await Review.findOneAndUpdate(
                { tour, user },
                { ...req.body, tour, user },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!newReview) {
                throw new customError(`No matching review`, 404);
            }

            res.status(201).json({
                status: "success",
                data: {
                    newReview,
                },
            });
        });
    }

    deleteReviewByTour() {
        return catchAsync(async (req, res) => {
            let user = req.user._id;
            const tour = req.params.tourId;
            if (req.params.userId) user = req.params.userId;
            const review = await Review.findOneAndDelete({ tour, user });

            if (!review) {
                throw new customError(`No matching review`, 404);
            }

            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
}

module.exports = new ReviewController();
