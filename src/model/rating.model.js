import mongoose, { mongo } from "mongoose";

const ratingSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    rater: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    rated: {type: mongoose.Schema.Types.ObjectId, ref:"recepie", required: true}
},{
   timestamps: true,
   toJSON: {
    transform: function(doc, ret){
        delete ret.__v;
    }
   } 
});

const ratingModel = mongoose.model("rating", ratingSchema);

export default ratingModel;

