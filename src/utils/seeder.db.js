import mongoose from "mongoose";
import { connectDb } from "../config/connect.database.js";
import roleModel from "../model/role.model.js";
import { role } from "./enum.js";


await connectDb();

console.log("Droping roles");
await roleModel.deleteMany({});


console.log("Started seeding");
for(const [key, value] of Object.entries(role)){
    const newRole = new roleModel({
        roleName: value.roleName,
        permission: value.permissions
    })

    await newRole.save();
}

console.log("Finished seeding db");

process.exit();