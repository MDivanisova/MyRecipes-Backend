import mongoose from "mongoose"
import { env } from "./config.env.js"

const connectDb= async ()=>{
    try{
        console.log("Mongo URI exists:", !!env.DATABASE);
        await mongoose.connect(env.DATABASE);
        console.log("Connected to databse.")
    }
    catch(err){
        console.log(`Databse threw the follwoing error: ${err}`)
        process.exit(0);
    }
    
}

export {
    connectDb
}