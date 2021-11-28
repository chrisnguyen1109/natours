const express = require("express");
const router = express.Router({ mergeParams: true });
const { checkAuth } = require("../controllers/authController");
const { checkRole } = require("../middlewares/authMiddleware");
const checkBooked = require("../middlewares/reviewMiddleware");
const reviewController = require("../controllers/reviewController");
const {
    getReviewByTour,
    deleteReviewByTour,
    createReviewByTour,
    updateReviewByTour,
    getMyReviewByTour,
} = reviewController;

router.route("/").get(getReviewByTour());

router.use(checkAuth());

router.route("/me").get(getMyReviewByTour());

router.route("/:userId").delete(checkRole("admin"), deleteReviewByTour());

router.use(checkBooked);

router.route("/").post(createReviewByTour()).put(updateReviewByTour()).delete(deleteReviewByTour());

module.exports = router;
