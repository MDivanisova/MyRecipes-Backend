import mongoose from "mongoose";
import { env } from "../config/config.env.js";

let isConnected = false;

const connectDb = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        console.log("Already connected to database.");
        return;
    }

    try {
        console.log(`Mongo URI exists: ${!!env.DATABASE}`);
        const db = await mongoose.connect(env.DATABASE);
        isConnected = db.connections[0].readyState === 1;
        console.log("Connected to database.");
    } catch (error) {
        isConnected = false;
        console.log("Database threw the following error:", error);
        console.log("Name:", error.name);
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        throw error;
        exit(1);
    }
};

export { connectDb };