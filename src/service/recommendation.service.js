import recepieModel from "../model/recepie.model.js";
import ratingModel from "../model/rating.model.js";
import bookmarkModel from "../model/bookmark.model.js";
import recommendationModel from "../model/recommendation.model.js";
import userModel from "../model/user.model.js";

const BOOKMARK_WEIGHT = 0.5;

const RATING_WEIGHTS = {
    1: -1.0,
    2: 0.2,
    3: 0.5,
    4: 0.8,
    5: 1.0
};

const CUISINE_WEIGHT = 0.25;
const CATEGORY_WEIGHT = 0.20;
const INGREDIENT_WEIGHT = 0.30;
const COOKING_METHOD_WEIGHT = 0.10;
const TIME_WEIGHT = 0.05;
const NUTRITION_WEIGHT = 0.10;


// ----------------------------------------
// Normalize string
// ----------------------------------------

function normalize(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .trim();
}


// ----------------------------------------
// Normalize array
// ----------------------------------------

function normalizeArray(array) {

    if (!Array.isArray(array)) {
        return [];
    }

    return array
        .map(value => normalize(value))
        .filter(value => value.length > 0);
}


// ----------------------------------------
// Normalize preference values
// ----------------------------------------

function normalizePreferences(preferences) {

    const values =
        Object.values(preferences);

    if (!values.length) {
        return {};
    }

    const maxPositiveValue =
        Math.max(
            ...values.filter(value => value > 0),
            0
        );

    const maxNegativeValue =
        Math.abs(
            Math.min(
                ...values.filter(value => value < 0),
                0
            )
        );

    const normalizedPreferences = {};

    Object.entries(preferences)
        .forEach(([key, value]) => {

            if (value > 0 && maxPositiveValue > 0) {

                normalizedPreferences[key] =
                    value / maxPositiveValue;

            } else if (
                value < 0 &&
                maxNegativeValue > 0
            ) {

                normalizedPreferences[key] =
                    value / maxNegativeValue;

            } else {

                normalizedPreferences[key] = 0;
            }
        });

    return normalizedPreferences;
}


// ----------------------------------------
// Get total recipe time
// ----------------------------------------

function getRecipeTotalTime(recipe) {

    const preparationTime = Number(
        recipe.preparationTime?.toString() ?? 0
    );

    const cookingTime = Number(
        recipe.cookingTime?.toString() ?? 0
    );

    return preparationTime + cookingTime;
}


// ----------------------------------------
// Parse nutrition value
// ----------------------------------------

function parseNutritionValue(value) {

    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : 0;
    }

    const match =
        String(value).match(/-?\d+(\.\d+)?/);

    if (!match) {
        return 0;
    }

    return Number(match[0]);
}


// ----------------------------------------
// Calculate array similarity
// ----------------------------------------

function calculateArraySimilarity(
    recipeValues,
    userValues
) {

    if (!recipeValues.length || !userValues.length) {
        return 0;
    }

    const recipeSet = new Set(recipeValues);

    const matches = userValues.filter(value =>
        recipeSet.has(value)
    );

    return matches.length / userValues.length;
}


// ----------------------------------------
// Ingredient similarity
// ----------------------------------------

function calculateIngredientSimilarity(
    recipe,
    userProfile
) {

    if (
        !recipe.ingredients?.length ||
        !Object.keys(userProfile.ingredientPreferences).length
    ) {
        return 0;
    }

    let score = 0;

    recipe.ingredients.forEach(item => {

        const ingredient = normalize(item.ingredient);

        if (!ingredient) {
            return;
        }

        const preference =
            userProfile.ingredientPreferences[ingredient];

        if (preference) {
            score += preference;
        }
    });

    const ingredientCount =
        recipe.ingredients.length;

    if (!ingredientCount) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            score / ingredientCount,
            1
        )
    );
}


// ----------------------------------------
// Time similarity
// ----------------------------------------

function calculateTimeSimilarity(
    recipe,
    userProfile
) {

    if (!userProfile.averageCookingTime) {
        return 0;
    }

    const recipeTime =
        getRecipeTotalTime(recipe);

    if (!recipeTime) {
        return 0;
    }

    const difference =
        Math.abs(
            recipeTime -
            userProfile.averageCookingTime
        );

    return Math.max(
        0,
        1 -
        difference /
        userProfile.averageCookingTime
    );
}


// ----------------------------------------
// Nutrition similarity
// ----------------------------------------

function calculateNutritionSimilarity(
    recipe,
    userProfile
) {

    if (
        !recipe.nutrition ||
        !Object.keys(userProfile.averageNutrition).length
    ) {
        return 0;
    }

    const fields = [
        "calories",
        "carbohydrates",
        "cholesterol",
        "fiber",
        "protein",
        "saturatedFat",
        "sodium",
        "sugar",
        "fat",
        "unsaturatedFat"
    ];

    let totalSimilarity = 0;
    let count = 0;

    fields.forEach(field => {

        const recipeValue =
            parseNutritionValue(
                recipe.nutrition[field]
            );

        const userValue =
            userProfile.averageNutrition[field];

        if (
            Number.isNaN(recipeValue) ||
            Number.isNaN(userValue) ||
            userValue <= 0
        ) {
            return;
        }

        const difference =
            Math.abs(recipeValue - userValue);

        const similarity =
            Math.max(
                0,
                1 - difference / userValue
            );

        totalSimilarity += similarity;
        count++;
    });

    if (!count) {
        return 0;
    }

    return totalSimilarity / count;
}


// ----------------------------------------
// Build user profile
// ----------------------------------------

function buildUserProfile(interactions) {

    const cuisinePreferences = {};
    const categoryPreferences = {};
    const ingredientPreferences = {};
    const cookingMethodPreferences = {};

    let totalCookingTime = 0;
    let totalTimeWeight = 0;

    const nutritionTotals = {
        calories: 0,
        carbohydrates: 0,
        cholesterol: 0,
        fiber: 0,
        protein: 0,
        saturatedFat: 0,
        sodium: 0,
        sugar: 0,
        fat: 0,
        unsaturatedFat: 0
    };

    const nutritionWeights = {
        calories: 0,
        carbohydrates: 0,
        cholesterol: 0,
        fiber: 0,
        protein: 0,
        saturatedFat: 0,
        sodium: 0,
        sugar: 0,
        fat: 0,
        unsaturatedFat: 0
    };


    interactions.forEach(interaction => {

        const recipe = interaction.recipe;

        if (!recipe) {
            return;
        }

        let weight = 0;


        // -----------------------------
        // Bookmark
        // -----------------------------

        if (interaction.type === "bookmark") {
            weight = BOOKMARK_WEIGHT;
        }


        // -----------------------------
        // Rating
        // -----------------------------

        if (interaction.type === "rating") {

            weight =
                RATING_WEIGHTS[interaction.rating] ?? 0;
        }


        if (weight === 0) {
            return;
        }


        // -----------------------------
        // Cuisine
        // -----------------------------

        const cuisines =
            normalizeArray(recipe.cuisine);

        cuisines.forEach(cuisine => {

            cuisinePreferences[cuisine] =
                (cuisinePreferences[cuisine] || 0) +
                weight;
        });


        // -----------------------------
        // Category
        // -----------------------------

        const categories =
            normalizeArray(recipe.category);

        categories.forEach(category => {

            categoryPreferences[category] =
                (categoryPreferences[category] || 0) +
                weight;
        });


        // -----------------------------
        // Ingredients
        // -----------------------------

        recipe.ingredients?.forEach(item => {

            const ingredient =
                normalize(item.ingredient);

            if (!ingredient) {
                return;
            }

            ingredientPreferences[ingredient] =
                (ingredientPreferences[ingredient] || 0) +
                weight;
        });


        // -----------------------------
        // Cooking methods
        // -----------------------------

        const methods =
            normalizeArray(recipe.cookingMethods);

        methods.forEach(method => {

            cookingMethodPreferences[method] =
                (cookingMethodPreferences[method] || 0) +
                weight;
        });


        // -----------------------------
        // Cooking time
        // -----------------------------

        const recipeTime =
            getRecipeTotalTime(recipe);

        if (recipeTime > 0) {

            const absoluteWeight =
                Math.abs(weight);

            totalCookingTime +=
                recipeTime * absoluteWeight;

            totalTimeWeight +=
                absoluteWeight;
        }


        // -----------------------------
        // Nutrition
        // -----------------------------

        if (recipe.nutrition) {

            Object.keys(nutritionTotals)
                .forEach(field => {

                    const value =
                        parseNutritionValue(
                            recipe.nutrition[field]
                        );

                    if (
                        !Number.isNaN(value) &&
                        value > 0
                    ) {

                        const absoluteWeight =
                            Math.abs(weight);

                        nutritionTotals[field] +=
                            value * absoluteWeight;

                        nutritionWeights[field] +=
                            absoluteWeight;
                    }
                });
        }
    });


    // --------------------------------
    // Calculate average nutrition
    // --------------------------------

    const averageNutrition = {};

    Object.keys(nutritionTotals)
        .forEach(field => {

            if (nutritionWeights[field] > 0) {

                averageNutrition[field] =
                    nutritionTotals[field] /
                    nutritionWeights[field];
            }
        });


    return {

        cuisinePreferences:
            normalizePreferences(
                cuisinePreferences
            ),

        categoryPreferences:
            normalizePreferences(
                categoryPreferences
            ),

        ingredientPreferences:
            normalizePreferences(
                ingredientPreferences
            ),

        cookingMethodPreferences:
            normalizePreferences(
                cookingMethodPreferences
            ),

        averageCookingTime:
            totalTimeWeight > 0
                ? totalCookingTime / totalTimeWeight
                : 0,

        averageNutrition
    };
}


// ----------------------------------------
// Calculate recipe score
// ----------------------------------------

function calculateRecipeScore(
    recipe,
    userProfile
) {

    const cuisines =
        normalizeArray(recipe.cuisine);

    const categories =
        normalizeArray(recipe.category);

    const methods =
        normalizeArray(recipe.cookingMethods);


    // --------------------------------
    // Cuisine
    // --------------------------------

    const cuisineScore =
        calculatePreferenceSimilarity(
            cuisines,
            userProfile.cuisinePreferences
        );


    // --------------------------------
    // Category
    // --------------------------------

    const categoryScore =
        calculatePreferenceSimilarity(
            categories,
            userProfile.categoryPreferences
        );


    // --------------------------------
    // Ingredients
    // --------------------------------

    const ingredientScore =
        calculateIngredientSimilarity(
            recipe,
            userProfile
        );


   // --------------------------------
// Cooking methods
// --------------------------------

const cookingMethodScore =
    calculatePreferenceSimilarity(
        methods,
        userProfile.cookingMethodPreferences
    );


    // --------------------------------
    // Time
    // --------------------------------

    const timeScore =
        calculateTimeSimilarity(
            recipe,
            userProfile
        );


    // --------------------------------
    // Nutrition
    // --------------------------------

    const nutritionScore =
        calculateNutritionSimilarity(
            recipe,
            userProfile
        );


    // --------------------------------
    // Final score
    // --------------------------------

    const score =
        cuisineScore * CUISINE_WEIGHT +
        categoryScore * CATEGORY_WEIGHT +
        ingredientScore * INGREDIENT_WEIGHT +
        cookingMethodScore * COOKING_METHOD_WEIGHT +
        timeScore * TIME_WEIGHT +
        nutritionScore * NUTRITION_WEIGHT;


    return score;
}


// ----------------------------------------
// Preference similarity
// ----------------------------------------

function calculatePreferenceSimilarity(
    recipeValues,
    preferences
) {

    if (
        !recipeValues.length ||
        !Object.keys(preferences).length
    ) {
        return 0;
    }

    let score = 0;

    recipeValues.forEach(value => {

        if (preferences[value]) {
            score += preferences[value];
        }
    });

    return Math.max(
        0,
        Math.min(score, 1)
    );
}


// ----------------------------------------
// Get recommendations
// ----------------------------------------

const getRecommendationsService = async (
    userId,
    minScore,
    limit,
    recipes = null
) => {

    // --------------------------------
    // Get bookmarks
    // --------------------------------

    const bookmarks =
        await bookmarkModel
            .find({ user: userId })
            .populate("recepie");


    // --------------------------------
    // Get ratings
    // --------------------------------

    const ratings =
        await ratingModel
            .find({ rater: userId })
            .populate("rated");


    // --------------------------------
    // Build interactions
    // --------------------------------

    const interactions = [];


    bookmarks.forEach(bookmark => {

        if (bookmark.recepie) {

            interactions.push({
                type: "bookmark",
                recipe: bookmark.recepie
            });
        }
    });


    ratings.forEach(rating => {

        if (rating.rated) {

            interactions.push({
                type: "rating",
                rating: rating.rating,
                recipe: rating.rated
            });
        }
    });


    // --------------------------------
    // New user
    // --------------------------------

    if (interactions.length < 10) {

        const popularRecipes =
            await recepieModel
                .find({
                    visibility: "public",
                    _id: {
                        $nin: interactions.map(
                            interaction =>
                                interaction.recipe._id
                        )
                    }
                })
                .sort({
                    rating: -1,
                    numberBookmarks: -1
                })
                .limit(limit);


        await recommendationModel.findOneAndUpdate(
            {
                forUser: userId
            },
            {
                forUser: userId,
                recommendations:
                    popularRecipes.map(
                        recipe => recipe._id
                    )
            },
            {
                upsert: true,
                returnDocument: "after"
            }
        );

        return;
    }


    // --------------------------------
    // Build profile
    // --------------------------------

    const userProfile =
        buildUserProfile(interactions);


    console.log("USER PROFILE");
    console.log(
        JSON.stringify(userProfile, null, 2)
    );


    // --------------------------------
    // IDs already interacted with
    // --------------------------------

    const interactedRecipeIds =
        interactions.map(
            interaction =>
                interaction.recipe._id.toString()
        );


    // --------------------------------
    // Get recipes
    // --------------------------------

    let recipesToScore = recipes;

    if (!recipesToScore) {

        console.time("get recipes");

        recipesToScore =
            await recepieModel
                .find({
                    visibility: "public",
                    creator: {
                        $ne: userId
                    },
                    _id: {
                        $nin: interactedRecipeIds
                    }
                })
                .select(
                    "cuisine category ingredients cookingMethods preparationTime cookingTime nutrition"
                )
                .lean();

        console.timeEnd("get recipes");
    }


    // --------------------------------
    // Score recipes
    // --------------------------------

    console.time("calculate scores");

    const recommendations =
        recipesToScore
            .filter(recipe =>
                recipe.creator?.toString() !==
                userId.toString()
            )
            .filter(recipe =>
                !interactedRecipeIds.includes(
                    recipe._id.toString()
                )
            )
            .map(recipe => {

                const score =
                    calculateRecipeScore(
                        recipe,
                        userProfile
                    );

                return {
                    recipe,
                    score
                };
            })
            .filter(item =>
                item.score > minScore
            );

    console.timeEnd("calculate scores");


    // --------------------------------
    // Sort
    // --------------------------------

    console.time("sort");

    recommendations.sort(
        (a, b) =>
            b.score - a.score
    );

    console.timeEnd("sort");


    // --------------------------------
    // Save recommendations
    // --------------------------------

    const recommendationIds =
        recommendations.map(
            recommendation =>
                recommendation.recipe._id
        );


    await recommendationModel.findOneAndUpdate(
        {
            forUser: userId
        },
        {
            forUser: userId,
            recommendations: recommendationIds
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    );
};
export const makeRecommendedForAllUsers = async (minScore, limit = 20) => {
    console.log("Starting recommendation generation for all users...");
    const users =
        await userModel.find({
            isVerified: true
        }).select("_id");


        console.time("get all recipes");

        const recipes =
        await recepieModel
            .find({
                visibility: "public"
            })
            .select(
                "cuisine category ingredients cookingMethods preparationTime cookingTime nutrition creator"
            )
            .lean();

    console.timeEnd("get all recipes");


    for (const user of users) {

        await getRecommendationsService(
            user._id,
            minScore,
            limit,
            recipes
        );
    }


    return {
        msg: "Recommendations created for all verified users"
    };
}; 


export const getAllRecommendationsService = async (
    pageNumber,
    pageSize,
    userId,
    filter
) => {

    const recommendation = await recommendationModel.findOne({
        forUser: userId
    });

    if (!recommendation) {
        return {
            msg: "No recommendations found",
            result: {
                recepies: [],
                pagination: {
                    numRecepies: 0,
                    totalPages: 0,
                    pageNumber,
                    pageSize
                }
            },
            statusCode: 200
        };
    }

    const numRecepies = recommendation.recommendations.length;

    const skip = (pageNumber - 1) * pageSize;

    const recommendedIds = recommendation.recommendations.slice(
        skip,
        skip + pageSize
    );

    const recepies = await recepieModel.find({
        ...filter,
        _id: {
            $in: recommendedIds
        }
    })
        .populate("creator")
        .sort({
            createdAt: -1,
            name: 1
        });

    const bookmarks = await bookmarkModel.find({
        user: userId
    });

    const bookmarkedIds = bookmarks.map(bookmark =>
        bookmark.recepie.toString()
    );

    const recepiesWithBookmark = recepies.map(recepie => ({
        ...recepie.toObject(),

        isBookmarked: bookmarkedIds.includes(
            recepie._id.toString()
        )
    }));

    const totalPages = Math.ceil(
        numRecepies / pageSize
    );

    return {
        msg: "recommendations were successfully fetched",

        result: {
            recepies: recepiesWithBookmark,

            pagination: {
                numRecepies,
                totalPages,
                pageNumber,
                pageSize
            }
        },

        statusCode: 200
    };
};