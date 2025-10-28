import express from "express";
import dotenv from "dotenv";
import db_connection from "./db/index.js";

const app = express();
dotenv.config({ path: "../.env" });
console.log(`MONGODB_URI is: ${process.env.MONGODB_URI}`);
db_connection();
app.listen(process.env.PORT, () => {
    console.log(`The app is running on port: ${process.env.PORT}`);
});
