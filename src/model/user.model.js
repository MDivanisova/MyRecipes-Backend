import mongoose from "mongoose";
import { gender } from "../utils/enum.js";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    gender: {type: String, required: true, enum: [gender.FEMALE, gender.MALE]},
    age: {type: Number, required: false},
    description: {type: String, required: false},
    recepie: [{type:mongoose.Schema.Types.ObjectId, ref:"recepie", required: false}],
    role: {type: mongoose.Schema.Types.ObjectId, ref:"role", required: true},
    lastSeen: {type: Date, required: false},
    reviewsWriten: {type: Number, required: false, default: 0},
    bookmarks: {type: Number, required: false, default: 0},
},{
    timestamps: true,
    toJSON: function(doc, ret){
        delete ret.__v;
        delete ret.password;
    }
});


const userModel = mongoose.model("user", userSchema);

export default userModel;