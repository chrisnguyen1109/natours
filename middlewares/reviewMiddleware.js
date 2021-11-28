const customError = require("../utils/customError");
const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");

module.exports = catchAsync(async (req, res, next) => {
    const tour = req.params.tourId;
    const user = req.user._id;

    const booking = await Booking.findOne({ tour, user });

    if (!booking) throw new customError("You must book this tour to review it!", 401);

    next();
});
