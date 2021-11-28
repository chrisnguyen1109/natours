const express = require("express");
const app = express();
const path = require("path");
const tourRouter = require("./routes/tour");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const viewRouter = require("./routes/view");
const bookingRouter = require("./routes/booking");
const { globalErrorHandler } = require("./controllers/errorController");
const customError = require("./utils/customError");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");

// const whitelist = [];

// const corsOptions = {
//     origin: (origin, fn) => {
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//             fn(null, true);
//         } else {
//             fn(new customError("Not allowed by CORS"));
//         }
//     },
//     methods: "*",
//     credentials: true,
// };
// app.use(cors(corsOptions));

const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: "Too many accounts created from this IP, please try again after an hour",
});

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use("/api/", apiLimiter);

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "./public")));
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "./views/layout"));

app.use(compression());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/users/admin", adminRouter);
app.use("/api/v1/bookings", bookingRouter);

app.use("/", viewRouter);

app.all("*", (req, res, next) => {
    next(new customError(`Can't find ${req.originalUrl} on this server`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
