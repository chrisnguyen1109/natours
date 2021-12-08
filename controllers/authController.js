const customError = require("../utils/customError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const Email = require("../utils/sendEmail");
const genTokenAsync = require("../utils/generateToken");

class AuthController {
    signUp() {
        return catchAsync(async (req, res) => {
            const reqBodyClone = JSON.parse(JSON.stringify(req.body));
            delete reqBodyClone["role"];
            const newUser = await User.create(reqBodyClone);

            const activeToken = await newUser.generateToken();
            const url = `${req.protocol}://${req.get(
                "host"
            )}/api/v1/auth/activate-account/${activeToken}`;
            const data = {
                subject: "Welcome to the Natours Family!",
                url,
                fullname: newUser.fullName,
            };
            await new Email(newUser.email, data).sendWelcome();

            res.status(201).json({
                status: "success",
                data: {
                    newUser,
                },
            });
        });
    }

    logIn() {
        return catchAsync(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password)
                throw new customError("Please provide email and password", 400);

            const user = await User.findByCredentials(email, password);

            const accessToken = await genTokenAsync({ id: user._id }, "login");
            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                sameSite: "strict",
                secure: req.secure || req.headers["x-forwarded-proto"] === "https",
            };

            res.cookie("access_token", accessToken, cookieOptions);
            res.json({
                status: "success",
                data: {
                    accessToken,
                    user,
                },
            });
        });
    }

    activateAccount() {
        return catchAsync(async (req, res) => {
            const activeToken = req.params.token;

            const decodeAsync = promisify(jwt.verify);
            const { id } = await decodeAsync(activeToken, process.env.PASSWORD_RESETTOKEN_KEY);

            User.allowActiveSelect = true;
            const user = await User.findById(id);
            if (!user)
                throw new customError(
                    "This user doesn't seem to have created an account yet!",
                    401
                );

            user.active = true;
            await user.save();

            res.redirect("/login");
        });
    }

    checkAuth() {
        return catchAsync(async (req, res, next) => {
            const header = req.headers;
            let token;
            res.locals.user = undefined;
            if (header.authorization && header.authorization.startsWith("Bearer")) {
                token = header.authorization.split(" ")[1];
            } else if (req.cookies && req.cookies.access_token) {
                token = req.cookies.access_token;
            }

            if (!token)
                throw new customError("You are not log in! Please log in to get access", 401);

            const readFileAsync = promisify(fs.readFile);
            const publicKey = await readFileAsync(
                path.join(__dirname, "../config/keys/publicKey.pem")
            );
            const decodeAsync = promisify(jwt.verify);
            const { id, iat } = await decodeAsync(token, publicKey);

            const user = await User.findById(id);
            if (!user) throw new customError("This user seems to no longer exist", 401);

            if (user.checkPasswordModified(iat))
                throw new customError("User recently changed password! Please log in again", 401);

            req.user = user;
            res.locals.user = user;

            next();
        });
    }

    isLoggedIn() {
        return catchAsync(async (req, res, next) => {
            res.locals.user = undefined;
            if (req.cookies && req.cookies.access_token) {
                const token = req.cookies.access_token;

                const readFileAsync = promisify(fs.readFile);
                const publicKey = await readFileAsync(
                    path.join(__dirname, "../config/keys/publicKey.pem")
                );
                const decodeAsync = promisify(jwt.verify);
                const { id, iat } = await decodeAsync(token, publicKey);

                const user = await User.findById(id);
                if (!user) return next();

                if (user.checkPasswordModified(iat)) return next();

                res.locals.user = user;
            }
            next();
        });
    }

    logOut(req, res, next) {
        res.clearCookie("access_token");
        res.json({
            status: "success",
        });
    }

    forgotPassword() {
        return catchAsync(async (req, res) => {
            const user = await User.findOne({ email: req.body.email });
            if (!user) throw new customError("There is no user with email address", 404);

            const resetToken = await user.generateToken();
            // const updatedUser = await user.save({ validateBeforeSave: false });

            const url = `${req.protocol}://${req.get(
                "host"
            )}/api/v1/auth/reset-password/${resetToken}`;

            const data = {
                subject: "Your password reset token (valid for 1 hour)",
                url,
                fullname: user.fullName,
            };

            await new Email(user.email, data).sendResetPassword();
            // await sendMail({
            //     email: user.email,
            //     subject: "Your password reset token (valid for 1 hour)",
            //     message,
            // });

            res.json({
                status: "success",
                message: "Token sent to email",
            });
        });
    }

    resetPassword() {
        return catchAsync(async (req, res) => {
            const resetToken = req.params.token;
            const { password, confirmPassword } = req.body;

            const decodeAsync = promisify(jwt.verify);
            const { id } = await decodeAsync(resetToken, process.env.PASSWORD_RESETTOKEN_KEY);

            const user = await User.findById(id);
            if (!user) throw new customError("This user seems to no longer exist", 401);

            if (!password || !confirmPassword)
                throw new customError("Please provide your new password and confirm password", 400);
            user.password = password;
            user.confirmPassword = confirmPassword;
            await user.save();

            res.json({
                status: "succes",
                message: "Reset password successfully!",
            });
        });
    }

    getMe() {
        return catchAsync(async (req, res) => {
            const user = await User.findById(req.user._id);

            res.json({
                status: "success",
                data: {
                    user,
                },
            });
        });
    }

    updatePassword() {
        return catchAsync(async (req, res) => {
            const { currentPassword, password, confirmPassword } = req.body;

            if (!currentPassword || !password || !confirmPassword)
                throw new customError("Please provide all neccessary information", 400);

            const user = await User.findByCredentials(req.user.email, currentPassword);

            user.password = password;
            user.confirmPassword = confirmPassword;
            await user.save();

            const accessToken = await genTokenAsync({ id: user._id }, "updatePassword");
            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                sameSite: "strict",
                secure: req.secure || req.headers["x-forwarded-proto"] === "https",
            };

            res.cookie("access_token", accessToken, cookieOptions);

            res.json({
                status: "success",
                data: {
                    accessToken,
                },
            });
        });
    }

    updateMe() {
        return catchAsync(async (req, res) => {
            const validFields = ["firstName", "lastName"];
            const validObj = {};
            validFields.forEach((el) => {
                validObj[el] = req.body[el];
            });
            req.file && (validObj.photo = req.file.filename);
            const user = await User.findByIdAndUpdate(req.user._id, validObj, {
                new: true,
                runValidators: true,
            });

            res.json({
                status: "success",
                user,
            });
        });
    }

    deleteMe() {
        return catchAsync(async (req, res) => {
            await User.findByIdAndUpdate(req.user._id, { active: false });

            res.status(204).json({
                status: "success",
                user: null,
            });
        });
    }
}

module.exports = new AuthController();
