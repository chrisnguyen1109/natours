const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { uploadPhotoFile, resizeFile } = require("../utils/uploadUserPhoto");
const {
    signUp,
    logIn,
    forgotPassword,
    resetPassword,
    updatePassword,
    checkAuth,
    updateMe,
    deleteMe,
    getMe,
    logOut,
    activateAccount,
} = authController;
const mongoSanitize = require("express-mongo-sanitize")();

router.use(mongoSanitize);

router.post("/signup", signUp());
router.post("/login", logIn());
router.get("/activate-account/:token", activateAccount());
router.post("/forgot-password", forgotPassword());
router.patch("/reset-password/:token", resetPassword());

router.use(checkAuth());

router.get("/logout", logOut);
router.patch("/update-password", updatePassword());
router.patch("/update-me", uploadPhotoFile, resizeFile, updateMe());
router.delete("/delete-me", deleteMe());
router.get("/me", getMe());

module.exports = router;
