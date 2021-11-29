const catchAsync = require("../utils/catchAsync");
const axiosApi = require("../utils/axiosApi");
const Tour = require("../models/tourModel");
const customError = require("../utils/customError");

class viewController {
    getOverviewPage() {
        return catchAsync(async (req, res) => {
            const tours = await Tour.find();

            res.render("overview", {
                title: "All Tours",
                tours,
            });
        });
    }

    getDetailPage() {
        return catchAsync(async (req, res) => {
            const slug = req.params.slug;
            const tour = await Tour.findOne({ slug }).populate("reviews");

            if (!tour) {
                throw new customError(`No tour with this name`, 404);
            }

            res.render("tour", {
                title: tour.name,
                tour,
            });
        });
    }

    getLoginPage() {
        return catchAsync(async (req, res) => {
            if (res.locals.user) {
                return res.status(301).redirect("/");
            }

            res.render("login", {
                title: "Login",
            });
        });
    }

    getMe(req, res, next) {
        res.render("account", {
            title: "Account",
        });
    }

    getSuccessPayment(req, res, next) {
        res.render("successPayment", { layout: false });
    }
}

module.exports = new viewController();
