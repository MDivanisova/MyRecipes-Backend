import mongoose, { mongo } from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    review: {type: mongoose.Schema.Types.ObjectId, ref:"review", required: true},
    text: {type: String, required: true},
    liker: [{type: mongoose.Schema.Types.ObjectId, ref:"user", required: false}],
    disliker: [{type: mongoose.Schema.Types.ObjectId, ref:"user", required: false}]
},{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    }
});

const commentModel = mongoose.model("comment", commentSchema);

export default commentModel;