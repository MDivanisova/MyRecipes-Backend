import mongoose from "mongoose";

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
    preparationTime: {type: Number, required: true},
    cookingTime: {type: Number, required: true},
    category: [{type: String, required: true}],
    cuisine: [{type: String, required: true}],
    ingredients: [{type: ingredientSchema, required: true}],
    instructions: [{type: String, required: true}],
    cookingMethods: [{type: String, required: true}],
    implements: [{type: String, required: true}],
    nutrition: [{type: nutritionSchema, required: true}],
    imageUrl: {type: String, required: true},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    rating: {type: Number, required: true},
    numberBookmarks: {type: Number, required: true},
    numberReview: {type: Number, required: true}
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

