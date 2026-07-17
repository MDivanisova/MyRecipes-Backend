import mongoose from "mongoose";
import {role} from "../utils/enum.js";

const roleSchema = new mongoose.Schema({
    roleNow: {type: String, required: true, enum: [role.ADMINISTRATOR, role.VIEWER, role.CHIEF, role.ASISTANTCHIEF]},
    Permission: [{type: String, required: true}]
},{
    timestamps: false,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    }
});

const roleModel = mongoose.model("role", roleSchema);

export default roleModel;