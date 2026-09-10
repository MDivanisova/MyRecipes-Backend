import z from "zod";
import { visibility } from "./enum.js";

const nutritionSchema = z.object({
    calories: z.string().min(1),
    carbohydrates: z.string().min(1),
    cholesterol: z.string().min(1),
    fiber: z.string().min(1),
    protein: z.string().min(1),
    saturatedFat: z.string().min(1),
    sodium: z.string().min(1),
    sugar: z.string().min(1),
    fat: z.string().min(1),
    unsaturatedFat: z.string().min(1)
})

const ingredientSchema = z.object({
  ingredient: z.string().min(1),
  quantity: z.string().min(1), 
  unit: z.string().min(1),
  misc: z.string().min(1) 
})

const recepieSchema = z.object({
    name: z.string().min(3, "name must be at least 3 characters").max(50,"name can't be more than 50 characters"),
    preparationTime : z.number().min(0),
    cookingTime: z.number().min(0),
    category: z.array(z.string()).min(1),
    cuisine: z.array(z.string()).min(1),
    ingredients: z.array(ingredientSchema).min(1),
    instructions: z.array(z.string()).min(1),
    cookingMethods: z.array(z.string()).min(1),
    tools: z.array(z.string()).min(1),
    nutrition: nutritionSchema,
    imageUrl: z.string().min(1, "recepieUrl is required").max(12000,""),
    creator: z.hex().min(24, "creator must be 24 characters").max(24),
    visibility: z.enum([visibility.PUBLIC, visibility.PRIVATE]),

});

const editRecepieSchema = z.object({
    _id: z.hex().min(24,"recepieId must be 24 characters").max(24,"recepieId must be 24 characters"),
    name: z.string().min(3,"name must be at least 3 characters").max(50,"name can't be more than 50 characters"),
    preparationTime : z.number().min(0),
    cookingTime: z.number().min(0),
    category: z.array(z.string()).min(1),
    cuisine: z.array(z.string()).min(1),
    ingredients: z.array(ingredientSchema).min(1),
    instructions: z.array(z.string()).min(1),
    cookingMethods: z.array(z.string()).min(1),
    tools: z.array(z.string()).min(1),
    nutrition: nutritionSchema,
    imageUrl: z.string().min(1, "recepieUrl is required").max(12000,""),
    creator: z.hex().min(24, "creator must be 24 characters").max(24),
    visibility: z.enum([visibility.PUBLIC, visibility.PRIVATE]),
})



export {
    recepieSchema,
    editRecepieSchema
}