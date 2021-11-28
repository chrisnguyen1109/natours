const mongoose = require("mongoose");

module.exports = {
    async connect() {
        const db =
            process.env.NODE_ENV === "production"
                ? process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD)
                : process.env.DATABASE_LOCAL;
        await mongoose.connect(db);
        console.log("Connect database successfully");
    },
};
