import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    recepie: {type: mongoose.Schema.Types.ObjectId, ref:"recepie", required: true},
},{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    }
});

const bookmarkModel = mongoose.model("bookmark", bookmarkSchema);

export default bookmarkModel;