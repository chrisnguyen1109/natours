const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const { getOverviewPage, getDetailPage, getLoginPage, getMe } = viewController;
const { isLoggedIn } = require("../controllers/authController");
const { checkAuth } = require("../controllers/authController");
const { checkRole } = require("../middlewares/authMiddleware");

router.route("/me").get(checkAuth(), getMe);

router.use(isLoggedIn());

router.route("/").get(getOverviewPage());
router.route("/tour/:slug").get(getDetailPage());
router.route("/login").get(getLoginPage());

module.exports = router;
