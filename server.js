require("dotenv").config({ path: "./config/.env" });
const app = require("./app");
const db = require("./config/db/connection");

const port = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
    console.log(err.name);
    console.log(err.message);
    console.log("UNCAUGHT EXCEPTION!");
    process.exit(1);
});

db.connect();

const server = app.listen(port, () => {
    console.log(`Listening on port: ${port}!`);
});

process.on("unhandledRejection", (err) => {
    console.log(err.name);
    console.log(err.message);
    console.log("UNHANDLED REJECTION!");
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("SIGTERM RECEIVED!");
    server.close(() => {
        console.log("Proccess terminated");
    });
});
