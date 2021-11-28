const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const {
    getCheckoutSession,
    getMyBookingTours,
    getAllBooking,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
} = bookingController;
const { checkAuth } = require("../controllers/authController");
const { checkRole } = require("../middlewares/authMiddleware");

router.use(checkAuth());

router.get("/checkout-session/:tourId", getCheckoutSession());

router.get("/my-tour", getMyBookingTours());

router.use(checkRole("admin"));

router.route("/").get(getAllBooking()).post(createBooking());

router.route("/:id").get(getBookingById()).patch(updateBooking()).delete(deleteBooking());

module.exports = router;
