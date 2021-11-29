const catchAsync = require("../utils/catchAsync");
const customError = require("../utils/customError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

const createBookingCheckout = async (session) => {
    console.log(session);
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email }))._id;
    const price = 100;
    await Booking.create({ tour, user, price });
};

class BookingController {
    getCheckoutSession() {
        return catchAsync(async (req, res) => {
            const tour = await Tour.findById(req.params.tourId);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                success_url: `${req.protocol}://${req.get("host")}`,
                cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
                customer_email: req.user.email,
                client_reference_id: req.params.tourId,
                mode: "payment",
                line_items: [
                    {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
                        ],
                        amount: tour.price * 100,
                        currency: "usd",
                        quantity: 1,
                    },
                ],
            });

            res.json({
                status: "success",
                session,
            });
        });
    }

    getWebhookCheckout(req, res) {
        try {
            const sig = req.headers["stripe-signature"];
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_ENDPOINT_SECRET
            );

            if (event.type === "checkout.session.completed") {
                createBookingCheckout(event.data.object);

                return res.json({
                    status: "success",
                });
            }

            throw new customError("Payment Error!", 400);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    getMyBookingTours() {
        return catchAsync(async (req, res) => {
            const bookings = await Booking.find({ user: req.user._id });

            const tourIDs = bookings.map((el) => el.tour._id);
            const tours = await Tour.find({ _id: { $in: tourIDs } });

            res.json({
                status: "success",
                results: bookings.length,
                data: {
                    tours,
                },
            });
        });
    }

    getAllBooking() {
        return catchAsync(async (req, res) => {
            const bookings = await Booking.find();

            res.json({
                status: "success",
                results: bookings.length,
                data: {
                    bookings,
                },
            });
        });
    }

    getBookingById() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const booking = await Booking.findById(id);

            if (!booking) {
                throw new customError(`No booking with this id: ${id}`, 404);
            }

            res.json({
                status: "success",
                data: {
                    booking,
                },
            });
        });
    }

    createBooking() {
        return catchAsync(async (req, res) => {
            const newBooking = await Booking.create(req.body);
            res.status(201).json({
                status: "success",
                data: {
                    newBooking,
                },
            });
        });
    }

    updateBooking() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const booking = await Booking.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });

            if (!booking) {
                throw new customError(`No booking with this id: ${id}`, 404);
            }

            res.json({
                status: "success",
                data: {
                    booking,
                },
            });
        });
    }

    deleteBooking() {
        return catchAsync(async (req, res) => {
            const id = req.params.id;
            const booking = await Booking.findByIdAndDelete(id);

            if (!booking) {
                throw new customError(`No booking with this id: ${id}`, 404);
            }

            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
}

module.exports = new BookingController();
