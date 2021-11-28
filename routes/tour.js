const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const {
    getAllTour,
    createTour,
    getTourById,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
} = tourController;
const { checkAuth } = require("../controllers/authController");
const { aliasTop5Cheapest } = require("../middlewares/tourMiddleware");
const { checkRole } = require("../middlewares/authMiddleware");
const reviewRouter = require("./review");
const { uploadTourImages, resizeTourImages } = require("../utils/uploadUserPhoto");
// const { checkValidId } = require("../controllers/tourController");

// router.param("id", checkValidId);

router.use("/:tourId/reviews", reviewRouter);

router.route("/top-5-cheapest").get(aliasTop5Cheapest, getAllTour());

router.route("/tour-stats").get(getTourStats());

router.route("/monthly-plan/:year").get(getMonthlyPlan());

router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getToursWithin());

router.route("/distance/:latlng/unit/:unit").get(getDistances());

router
    .route("/")
    .get(getAllTour())
    .post(checkAuth(), checkRole("admin"), uploadTourImages, resizeTourImages, createTour());

router
    .route("/:id")
    .get(getTourById())
    .patch(checkAuth(), checkRole("admin"), uploadTourImages, resizeTourImages, updateTour())
    .delete(checkAuth(), checkRole("admin"), deleteTour());

module.exports = router;
