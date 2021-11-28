const mongoose = require("mongoose");
const { Schema } = mongoose;
const Tour = require("./tourModel");

const trimmedString = { type: String, trim: true };

const reviewSchema = new Schema(
    {
        review: {
            ...trimmedString,
            required: [true, "Review cannot be empty!"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required!"],
            min: [1, "Rating must be above 1"],
            max: [5, "Rating must be below 5"],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            required: [true, "Review must be belong to a tour"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Review must be belong to a user"],
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
        id: false,
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tour) {
    const stats = await this.aggregate([
        {
            $match: { tour },
        },
        {
            $group: {
                _id: "$tour",
                ratingsQuantity: { $sum: 1 },
                ratingsAverage: { $avg: "$rating" },
            },
        },
    ]);

    if (stats.length > 0) {
        const { ratingsQuantity, ratingsAverage } = stats[0];
        await Tour.findByIdAndUpdate(tour, { ratingsQuantity, ratingsAverage });
    } else {
        await Tour.findByIdAndUpdate(tour, { ratingsQuantity: 0, ratingsAverage: 0 });
    }
};

reviewSchema.post("save", function () {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^find$/, function (next) {
    this.populate({
        path: "user",
        select: "firstName lastName email photo",
    });

    next();
});

reviewSchema.pre(/^findOne$/, function (next) {
    this.populate({
        path: "user",
        select: "firstName lastName email photo",
    });

    if (this._conditions.tour && this._conditions.user) {
        this.populate({
            path: "tour",
            select: "-guides name",
        });
    }

    next();
});

reviewSchema.post(/^findOneAnd/, function (doc) {
    if (doc) doc.constructor.calcAverageRatings(doc.tour);
});

module.exports = mongoose.model("Review", reviewSchema);
