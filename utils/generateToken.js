const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { promisify } = require("util");

module.exports = async (payload, type) => {
    let accessToken;
    const genTokenAsync = promisify(jwt.sign);
    if (type === "resetPassword") {
        accessToken = await genTokenAsync(payload, process.env.PASSWORD_RESETTOKEN_KEY, {
            expiresIn: process.env.PASSWORD_RESETTOKEN_EXPIRE,
        });
    } else {
        const readFileAsync = promisify(fs.readFile);
        const privateKey = await readFileAsync(
            path.join(__dirname, "../config/keys/privateKey.pem")
        );
        accessToken = await genTokenAsync(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRE,
        });
    }

    return accessToken;
};
