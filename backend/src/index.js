import db_connection from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { app } from "./app.js";

console.log(`MONGODB_URI is: ${process.env.MONGODB_URI}`);
db_connection()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`The app is running on port: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("ERROR: MongoDB connection failed!", error.message);
    });
