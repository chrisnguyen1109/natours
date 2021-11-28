const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            require: [true, "Booking must belong to a tour!"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            require: [true, "Booking must belong to a User!"],
        },
        price: {
            type: Number,
            require: [true, "Booking must have a price"],
        },
        paid: {
            type: Boolean,
            default: true,
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

bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "firstName lastName email photo",
    }).populate({
        path: "tour",
        select: "-guides name",
    });

    next();
});

module.exports = mongoose.model("Booking", bookingSchema);
