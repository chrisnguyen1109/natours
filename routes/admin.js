const express = require("express");
const router = express.Router();
const { createUserAdmin } = require("../controllers/userController");
const { checkAuth } = require("../controllers/authController");
const { checkRole } = require("../middlewares/authMiddleware");

router.route("/create-user-admin").post(checkAuth(), checkRole("admin"), createUserAdmin());

module.exports = router;
