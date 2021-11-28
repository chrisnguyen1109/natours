const mongoose = require("mongoose");
const validator = require("validator");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const genTokenAsync = require("../utils/generateToken");

const trimmedString = { type: String, trim: true };

const userSchema = new Schema(
    {
        firstName: {
            ...trimmedString,
            required: [true, "Name field must be required"],
        },
        lastName: {
            ...trimmedString,
            default: "",
        },
        email: {
            ...trimmedString,
            required: [true, "Email field must be required"],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, "Invalid email"],
        },
        password: {
            ...trimmedString,
            required: [true, "Password field must be requires"],
            minlength: 6,
            select: false,
        },
        confirmPassword: {
            ...trimmedString,
            required: [true, "Confirm password field must be required"],
            validate: {
                validator: function (val) {
                    return val === this.password;
                },
                message: "Password and confirm password does not match!",
            },
            select: false,
        },
        role: {
            type: String,
            enum: {
                values: ["user", "guide", "admin"],
                message: "Role is either: user, guide, admin",
            },
            default: "user",
        },
        photo: {
            type: String,
            default: "default.jpg",
        },
        passwordModified: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.password;
                delete ret.confirmPassword;
                delete ret.active;
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
        id: false,
    }
);

// this.isNew (check document create)

userSchema.pre(/^find/, async function (next) {
    if (this.model.allowActiveSelect === true) {
        this.model.allowActiveSelect = undefined;
        return next();
    }
    this.find({ active: { $ne: false } });
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordModified = Date.now();
    this.confirmPassword = null;
    next();
});

userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.methods.comparePassword = async (password, userPassword) => {
    return await bcrypt.compare(password, userPassword);
};

userSchema.methods.checkPasswordModified = function (jwtIat) {
    if (this.passwordModified) {
        return parseInt(this.passwordModified.getTime() / 1000) > jwtIat;
    }
    return false;
};

userSchema.methods.generateToken = async function () {
    const resetToken = await genTokenAsync({ id: this._id }, "resetPassword");

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
