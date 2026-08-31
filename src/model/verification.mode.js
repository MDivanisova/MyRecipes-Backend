import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
    email: {type: String},
    code:{type: String},
    createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
})

const verificationCodeModel = mongoose.model("verification", verificationCodeSchema);

export default verificationCodeModel;
