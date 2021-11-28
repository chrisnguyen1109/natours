const customError = require("../utils/customError");

exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (roles.indexOf(req.user.role) == -1)
            return next(new customError("You do not have permission to perform this action!", 403));

        next();
    };
};
