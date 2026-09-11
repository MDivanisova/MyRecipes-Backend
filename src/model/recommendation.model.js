import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
    forUser: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: false},
    recommendations: [{type:mongoose.Schema.Types.ObjectId, ref:"recepie"}]
},{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    }
    
})


const recommendationModel = mongoose.model("recommendation", recommendationSchema);

export default recommendationModel;