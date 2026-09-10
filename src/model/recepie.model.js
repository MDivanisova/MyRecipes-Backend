import mongoose from "mongoose";
import { visibility } from "../utils/enum.js"

const ingredientSchema = new mongoose.Schema({
    ingredient: {type: String, required: true},
    quantity: {type: String, required: true},
    unit: {type: String, required: true},
    misc: {type: String, required: true}
})

const nutritionSchema = new mongoose.Schema({
    calories: {type: String, required: true},
    carbohydrates: {type: String, required: true},
    cholesterol: {type: String, required: true},
    fiber: {type: String, required: true},
    protein: {type: String, required: true},
    saturatedFat: {type: String, required: true},
    sodium: {type: String, required: true},
    sugar: {type: String, required: true},
    fat: {type: String, required: true},
    unsaturatedFat: {type: String, required: true}
})

const recepieSchema = new mongoose.Schema({
    name : {type: String, required: true},
    preparationTime: {type: mongoose.Schema.Types.Decimal128, required: true},
    cookingTime: {type: mongoose.Schema.Types.Decimal128, required: true},
    category: [{type: String, required: true}],
    cuisine: [{type: String, required: true}],
    ingredients: [{type: ingredientSchema, required: true}],
    instructions: [{type: String, required: true}],
    cookingMethods: [{type: String, required: true}],
    tools: [{type: String, required: true}],
    nutrition: {type: nutritionSchema, required: true},
    imageUrl: {type: String, required: true},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: false},
    rating: {type: mongoose.Schema.Types.Decimal128, required: false, default: 0.0},
    numberBookmarks: {type: Number, required: false, default: 0},
    numberReviews: {type: Number, required: false, default: 0},
    visibility: {type: String, required: false, enum: [visibility.PRIVATE, visibility.PUBLIC], default: visibility.PRIVATE}
},{
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.__v;
        }
    }
    
});




const recepieModel = mongoose.model("recepie", recepieSchema);

export default recepieModel;

