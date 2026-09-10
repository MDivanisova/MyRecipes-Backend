import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    reviewer: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    reviewed: {type: mongoose.Schema.Types.ObjectId, ref:"recepie", required: true},
    text: {type: String, required: true},
    comments: [{type:String, required: false}],
    liker: [{type: mongoose.Schema.Types.ObjectId, ref:"user", required: false}],
    disliker: [{type: mongoose.Schema.Types.ObjectId, ref:"user", required: false}]
},{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    },
});

const reviewModel = mongoose.model("review", reviewSchema);

export default reviewModel;