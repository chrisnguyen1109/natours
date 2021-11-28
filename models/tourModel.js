const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const { Schema } = mongoose;

const trimmedString = { type: String, trim: true };

const validatePrice = [
    {
        validator: async function (val) {
            return this.price ? val < this.price : true;
        },
        msg: "Discount price ({VALUE}) should be below regular price",
    },
    {
        validator: function (val) {
            return val > 0;
        },
        msg: "Discount price ({VALUE}) should be above 0",
    },
];

const tourSchema = new Schema(
    {
        name: {
            ...trimmedString,
            required: [true, "Name field must be required"],
            unique: true,
            minlength: [10, "Name field must have more or equal than 10 characters"],
            validate: {
                validator: function (val) {
                    return validator.isAlpha(val, "en-US", { ignore: " " });
                },
                message: "Name should only contain alphabets",
            },
        },
        slug: {
            ...trimmedString,
        },
        duration: {
            type: Number,
            required: [true, "Duration field must be required"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "Max group size field must be required"],
        },
        difficulty: {
            ...trimmedString,
            required: [true, "Difficulty field must be required"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty is either: easy, medium, difficult",
            },
        },
        price: {
            type: Number,
            required: [true, "Price field must be required"],
        },
        priceDiscount: {
            type: Number,
            validate: validatePrice,
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [1, "Ratings average must be above 1.0"],
            max: [5, "Ratings average must be below 5.0"],
            set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        summary: {
            ...trimmedString,
            required: [true, "Summary field must be required"],
        },
        description: {
            ...trimmedString,
        },
        imageCover: {
            type: String,
            required: [true, "Image cover field must be required"],
        },
        images: [String],
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
            select: false,
        },
        startLocation: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: "Point",
                    enum: ["Point"],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        // testMixedField: {
        //     type: Schema.Types.Mixed,
        // },
        // __v: { type: Number, select: false },
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

tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function (next) {
    if (!!this._conditions.secretTour === true) return next();
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-passwordModified",
    });
    next();
});

tourSchema.pre("aggregate", function (next) {
    let insertIndex = 0;
    if (this.pipeline()[0]["$geoNear"]) insertIndex = 1;
    this.pipeline().splice(insertIndex, 0, { $match: { secretTour: { $ne: true } } });

    next();
});

tourSchema.virtual("durationWeeks").get(function () {
    if (this.duration) {
        return (this.duration / 7).toFixed(2);
    }
});

tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id",
});

module.exports = mongoose.model("Tour", tourSchema);
