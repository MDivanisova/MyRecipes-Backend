import mongoose from "mongoose";
import {gender} from "../utils/enum.js";
import {pwHash, pwCmp} from "../utils/pw.hash.js";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    gender: {type: String, required: false, enum: [gender.FEMALE, gender.MALE]},
    age: {type: Number, required: false},
    description: {type: String, required: false},
    role: {type: mongoose.Schema.Types.ObjectId, ref:"role", required: true},
    lastLogedIn: {type: Date, required: false, default: new Date()},
    reviewsWriten: {type: Number, required: false, default: 0},
    bookmarks: {type: Number, required: false, default: 0},
    isVerified: {type: Boolean, default: false}
},{
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret){
            delete ret.__v;
            delete ret.password;
        }
    },
    toObject:{virtuals: true}
});


userSchema.virtual('recepies', {
    ref: 'recepie', 
    localField: '_id',
    foreignField: 'creator'
});

userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await pwHash(this.password) 
    }
    this.updatedAt = new Date();
})


userSchema.methods.compare = async function(password){
    const resultCmp = await pwCmp(password, this.password);
    
    return resultCmp;
}



const userModel = mongoose.model("user", userSchema);

export default userModel;