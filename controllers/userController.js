const customError = require("../utils/customError");
const catchAsync = require("../utils/catchAsync");
const featuresApi = require("../utils/featuresApi");
const User = require("../models/userModel");

class UserController {
    createUserAdmin() {
        return catchAsync(async (req, res, next) => {
            const newUser = await User.create(req.body);

            res.status(201).json({
                status: "success",
                data: {
                    newUser,
                },
            });
        });
    }
}

module.exports = new UserController();
