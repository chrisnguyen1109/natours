const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./catchAsync");
const customError = require("./customError");
const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "public/img/users/");
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split("/").pop();
//         cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//     },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new customError("Not an image file. Please upload an image!", 400));
};

const upload = multer({ storage, fileFilter });

exports.uploadPhotoFile = upload.single("photo");

exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 },
]);

exports.resizeFile = catchAsync(async (req, res, next) => {
    if (req.file) {
        if (!req.user.photo.startsWith("default")) {
            const deleteOldPhoto = promisify(fs.unlink);
            await deleteOldPhoto(path.join(__dirname, `../public/img/users/${req.user.photo}`));
        }

        req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/img/users/${req.file.filename}`);
    }

    next();
});

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (req.files?.imageCover) {
        req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`);
    }

    if (req.files?.images) {
        req.body.images = await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `tour-${req.params.id}-${Date.now()}-${i}.jpeg`;
                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${filename}`);
                return filename;
            })
        );
    }

    next();
});
