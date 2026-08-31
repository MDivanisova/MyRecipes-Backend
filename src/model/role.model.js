import mongoose from "mongoose";
import {role} from "../utils/enum.js";

const roleSchema = new mongoose.Schema({
    roleName: {type: String, required: true, 
        enum: [role.ADMIN.roleName, role.USERADMINISTRATOR.roleName, role.CHIEF.roleName, role.REGULARUSER.roleName, role.CONTENTMANAGER.roleName]},
    permission: [{type: String, required: true}]
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