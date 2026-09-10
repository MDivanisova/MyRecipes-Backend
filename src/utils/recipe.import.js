import fs from "fs";
import mongoose from "mongoose";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";

import { connectDb } from "../config/connect.database.js";
import recepieModel from "../model/recepie.model.js";
import { visibility } from "./enum.js";

const FILE_PATH = "./src/utils/output.json";

const BATCH_SIZE = 25;
const LOG_EVERY = 1000;

await connectDb();

console.log("Starting recipe import...");
console.log(`Reading: ${FILE_PATH}`);
console.log(`Batch size: ${BATCH_SIZE}`);

const pipeline = chain([
    fs.createReadStream(FILE_PATH),
    parser(),
    streamArray()
]);

let batch = [];
let insertedCount = 0;
let processedCount = 0;
let skippedCount = 0;

for await (const { value: recipe } of pipeline) {

    processedCount++;

    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
            .filter((ingredient) => ingredient?.ingredient?.trim())
            .map((ingredient) => ({
                ingredient: ingredient.ingredient.trim(),
                quantity: ingredient.quantity?.trim() || "N/A",
                unit: ingredient.unit?.trim() || "N/A",
                misc: ingredient.misc?.trim() || "N/A"
            }))
        : [];

    const instructions = Array.isArray(recipe.instructions)
        ? recipe.instructions
            .filter(
                (instruction) =>
                    typeof instruction === "string" &&
                    instruction.trim()
            )
            .map((instruction) => instruction.trim())
        : [];

    // Skip recipe if it has no valid ingredients
    if (ingredients.length === 0) {
        skippedCount++;
        continue;
    }

    // Skip recipe if it has no valid instructions
    if (instructions.length === 0) {
        skippedCount++;
        continue;
    }

    const category = Array.isArray(recipe.category)
    ? recipe.category.filter(
        (item) => typeof item === "string" && item.trim()
    )
    : [];

const cuisine = Array.isArray(recipe.cuisine)
    ? recipe.cuisine.filter(
        (item) => typeof item === "string" && item.trim()
    )
    : [];

if (cuisine.length === 0) {
    cuisine.push("World");
}

if (category.length === 0) {

    const recipeText = [
        recipe.name,
        ...(Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((ingredient) => ingredient?.ingredient || "")
            : [])
    ]
        .join(" ")
        .toLowerCase();

    if (
        /cake|cookie|cookies|chocolate|sugar|ice cream|pudding|pie|brownie|candy|dessert|muffin|cupcake|donut|doughnut|sweet/.test(recipeText)
    ) {
        category.push("Dessert");

    } else if (
        /chicken|beef|pork|lamb|turkey|steak|meat|sausage|ham|bacon/.test(recipeText)
    ) {
        category.push("Meat");

    } else if (
        /soup|stew|broth|chowder/.test(recipeText)
    ) {
        category.push("Soup");

    } else if (
        /salad/.test(recipeText)
    ) {
        category.push("Salad");

    } else if (
        /pasta|spaghetti|lasagna|lasagne|macaroni|noodle/.test(recipeText)
    ) {
        category.push("Pasta");

    } else if (
        /bread|bun|roll|bagel|croissant|biscuit|loaf/.test(recipeText)
    ) {
        category.push("Bakery");

    } else if (
        /rice|risotto|fried rice/.test(recipeText)
    ) {
        category.push("Rice");

    } else if (
        /pizza/.test(recipeText)
    ) {
        category.push("Pizza");

    } else {
        category.push("Other");
    }
}

    if (category.length === 0) {
        skippedCount++;
        continue;
    }

    if (cuisine.length === 0) {
        skippedCount++;
        continue;
    }

    const formattedRecipe = {
        name: recipe.name,
        preparationTime: recipe.preparationTime,
        cookingTime: recipe.cookingTime,
        category: category,
        cuisine: cuisine,

        ingredients,

        instructions,

        cookingMethods: Array.isArray(recipe.cookingMethods)
            ? recipe.cookingMethods
            : [],

        tools: Array.isArray(recipe.implements)
            ? recipe.implements
            : [],

        nutrition: {
            calories: recipe.nutrition?.calories?.trim() || "0 kcal",
            carbohydrates: recipe.nutrition?.carbohydrates?.trim() || "0 g",
            cholesterol: recipe.nutrition?.cholesterol?.trim() || "0 mg",
            fiber: recipe.nutrition?.fiber?.trim() || "0 g",
            protein: recipe.nutrition?.protein?.trim() || "0 g",
            saturatedFat: recipe.nutrition?.saturatedFat?.trim() || "0 g",
            sodium: recipe.nutrition?.sodium?.trim() || "0 mg",
            sugar: recipe.nutrition?.sugar?.trim() || "0 g",
            fat: recipe.nutrition?.fat?.trim() || "0 g",
            unsaturatedFat: recipe.nutrition?.unsaturatedFat?.trim() || "0 g"
        },

        imageUrl: recipe.imageUrl || "",

        visibility: visibility.PUBLIC,

        creator: null
    };

    batch.push(formattedRecipe);

    if (batch.length >= BATCH_SIZE) {

        const result = await recepieModel.insertMany(batch, {
            ordered: false,
            rawResult: true
        });

        insertedCount += result.insertedCount;

        if (result.mongoose?.validationErrors?.length) {

            console.log("Validation errors in batch:");

            result.mongoose.validationErrors.forEach((error) => {
                console.log(error.message);
            });
        }

        batch = [];

        if (insertedCount >= LOG_EVERY) {
            const currentLog = Math.floor(insertedCount / LOG_EVERY) * LOG_EVERY;

            if (currentLog > 0 && currentLog % LOG_EVERY === 0) {
                console.log(
                    `Processed: ${processedCount} | Inserted: ${insertedCount} | Skipped: ${skippedCount}`
                );
            }
        }
    }
}

// Insert whatever is left in the final batch.
if (batch.length > 0) {

    const result = await recepieModel.insertMany(batch, {
        ordered: false,
        rawResult: true
    });

    insertedCount += result.insertedCount;

    if (result.mongoose?.validationErrors?.length) {

        console.log("Validation errors in final batch:");

        result.mongoose.validationErrors.forEach((error) => {
            console.log(error.message);
        });
    }
}

console.log("-----------------------------------");
console.log("Recipe import finished!");
console.log(`Processed: ${processedCount}`);
console.log(`Inserted:  ${insertedCount}`);
console.log(`Skipped:   ${skippedCount}`);
console.log("-----------------------------------");

await mongoose.connection.close();

console.log("MongoDB connection closed.");