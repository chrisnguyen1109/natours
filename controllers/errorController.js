const customError = require("../utils/customError");

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new customError(message, 400);
};

const handleDulicateFieldsError = (err) => {
    const value = Object.values(err.keyValue)[0];
    const message = `Dulicate field for value: '${value}'.Please use another value!`;
    return new customError(message, 400);
};

const handleValidationError = (err) => {
    const excludeMessage = "validation failed:";
    const errorsIndex = err.message.indexOf(excludeMessage);
    const errors = err.message.slice(errorsIndex + excludeMessage.length);
    const message = `Invalid input:${errors}`;
    return new customError(message, 400);
};

const sendDevError = (err, res) => {
    console.error(`Error 😢: ${err}`);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

const sendProdError = (err, res) => {
    if (err.isExpose) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error(`Error 😢: ${err}`);
        res.status(500).json({
            status: "error",
            message: "Unknow error!",
        });
    }
};

class ErrorController {
    globalErrorHandler(err, req, res, next) {
        console.log(err.stack);

        err.statusCode = err.statusCode || 500;
        err.status = err.status || "error";

        let error = Object.create(err);
        if (process.env.NODE_ENV === "production") {
            error.name === "CastError" && (error = handleCastError(error));
            error.code === 11000 && (error = handleDulicateFieldsError(error));
            error.name === "ValidationError" && (error = handleValidationError(error));
            error.name === "JsonWebTokenError" && (error = new customError("Invalid token", 401));
            error.name === "TokenExpiredError" &&
                (error = new customError("Token has been expired", 401));
            error.name === "MulterError" && (error = new customError(error.message, 400));
        }

        if (req.originalUrl.startsWith("/api")) {
            if (process.env.NODE_ENV === "production") {
                return sendProdError(error, res);
            } else {
                return sendDevError(err, res);
            }
        } else {
            console.error(`Error 😢: ${err}`);
            res.status(err.statusCode).render("error", {
                title: "Something went wrong!",
                msg: err.message,
            });
        }
    }
}

module.exports = new ErrorController();
