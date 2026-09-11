import mongoose from "mongoose"
import { env } from "./config.env.js"

const connectDb= async ()=>{
    try{
        console.log(`Mongo URI exists: ${!!env.DATABASE}`);
        console.log(`Mongo URI: ${env.DATABASE}`);

        await mongoose.connect(env.DATABASE);
        console.log("Connected to databse.")
    }
    catch(error){
        console.log("Database threw the following error:", error);

    console.log("Name:", error.name);
    console.log("Message:", error.message);
    console.log("Code:", error.code);
    console.log("Reason:");

    console.dir(error.reason, {
        depth: 10
    });
    }
    
}

export {
    connectDb
}