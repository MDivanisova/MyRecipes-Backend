import mongoose from "mongoose"
import { env } from "./config.env.js"

const connectDb=()=>{
    try{
        mongoose.connect(env.DATABASE);
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