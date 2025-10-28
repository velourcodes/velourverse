import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const db_connection = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI,
            { dbName: process.env.DB_NAME }
        );
        console.log(
            `MongoDB connected successfully!\n DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("Error: MongoDB Failed to connect!", error);
        process.exit(1);
    }
};
export default db_connection;

// `${process.env.MONGODB_URI}/${DB_NAME}`
