import recepieModel from "../model/recepie.model.js";
import ratingModel from "../model/rating.model.js";
import bookmarkModel from "../model/bookmark.model.js";
import { visibility } from "../utils/enum.js";


const getSummaryStatisticsService = async (userId) => {

    const recipes = await recepieModel
            .find({ creator: userId })
            .select("rating numberBookmarks")
            .lean();


    const totalRecipes = recipes.length;


    const averageRating =
        totalRecipes > 0
            ? recipes.reduce((sum, recipe) =>sum + Number(recipe.rating || 0), 0) 
            / totalRecipes: 0;


    const averageBookmarks =
        totalRecipes > 0
            ? recipes.reduce((sum, recipe) => sum + Number(recipe.numberBookmarks || 0), 0) 
            / totalRecipes : 0;


    return {
        totalRecipes,
        averageRating: Number(averageRating.toFixed(2)),
        averageBookmarks: Number(averageBookmarks.toFixed(2))
    };
};


const getRatingStatisticsService = async (userId, topN, period) => {

    topN = Number(topN);
    period = Number(period);

    if (!Number.isInteger(topN) || topN < 1) {topN = 5;}

    if (!Number.isInteger(period) || period < 1) {period = 1;}

    // Last 30 * period days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (30 * period));

    // Get ratings from selected period
    const ratings = await ratingModel
        .find({
            createdAt: {
                $gte: fromDate
            }
        })
        .populate({
            path: "rated",
            populate: {
                path: "creator"
            }
        });

    // Get unique recipes
    const recipesMap = new Map();

    for (const rating of ratings) {

        if (!rating.rated) {
            continue;
        }

        if (rating.rated.visibility !== visibility.PUBLIC) {
            continue;
        }

        const recipe = rating.rated;
        const recipeId = recipe._id.toString();

        if (!recipesMap.has(recipeId)) {
            recipesMap.set(recipeId, recipe);
        }
    }

    // Convert Map to array
    const recipes = Array.from(recipesMap.values());

    // Sort by recipe.rating
    recipes.sort((a, b) => {

    const ratingA = a.rating
        ? Number(a.rating.toString())
        : 0;

    const ratingB = b.rating
        ? Number(b.rating.toString())
        : 0;

    return ratingB - ratingA;
});

    // Global Top N
    const globalTopRecipes = recipes
    .slice(0, topN)
    .map((recipe, index) => ({
        position: index + 1,
        recipe: {
            ...recipe.toObject(),
            rating: recipe.rating
                ? Number(recipe.rating.toString())
                : 0
        },
        creator: recipe.creator
    }));

    // User recipes
    const userRecipes = recipes.filter(recipe =>
        recipe.creator &&
        recipe.creator._id.toString() === userId.toString()
    );

    // User Top N
    const userTopRecipes = userRecipes
        .slice(0, topN)
        .map((recipe, index) => ({
            position: index + 1,
            recipe,
            creator: recipe.creator
        }));


    // User's best recipe global position
    let userTopRecipeGlobalPosition = {};

    if (userRecipes.length > 0) {

        const bestUserRecipe = userRecipes[0];

        const globalIndex = recipes.findIndex(recipe =>
            recipe._id.toString() === bestUserRecipe._id.toString()
        );

        if (globalIndex !== -1) {

            const globalPosition = globalIndex + 1;

            // If user's best recipe is NOT in Global Top N
            if (globalPosition > topN) {

                userTopRecipeGlobalPosition = {
                    position: globalPosition,
                    recipe: bestUserRecipe,
                    creator: bestUserRecipe.creator
                };
            }
        }
    }

    return {
        period,
        topN,
        userTopRecipes,
        globalTopRecipes,
        userTopRecipeGlobalPosition
    };
};

const getBookmarkStatisticsService = async (userId, topN, period) => {

    topN = Number(topN);
    period = Number(period);

    if (!Number.isInteger(topN) || topN < 1) { topN = 5;}
    if (!Number.isInteger(period) || period < 1) { period = 1;}


    // ==========================================
    // DATE RANGE
    // ==========================================

    const fromDate = new Date();

    fromDate.setDate(
        fromDate.getDate() - (30 * period)
    );


    // ==========================================
    // GET BOOKMARKS FROM PERIOD
    // ==========================================

    const bookmarks = await bookmarkModel
        .find({
            createdAt: {
                $gte: fromDate
            }
        })
        .populate({
            path: "recepie",
            populate: {
                path: "creator"
            }
        })
        .lean();


    // ==========================================
    // COUNT BOOKMARKS PER RECIPE
    // ==========================================

    const recipesMap = new Map();

    for (const bookmark of bookmarks) {

        if (!bookmark.recepie) {
            continue;
        }

        // Only public recipes
        if (bookmark.recepie.visibility !== visibility.PUBLIC) {
            continue;
        }

        const recipe = bookmark.recepie;
        const recipeId = recipe._id.toString();

        if (!recipesMap.has(recipeId)) {
            recipesMap.set(recipeId, {
                recipe,
                numberBookmarks: 0
            });
        }
        recipesMap.get(recipeId).numberBookmarks++;
    }


    // ==========================================
    // CONVERT MAP TO ARRAY
    // ==========================================
    const recipes = Array.from( recipesMap.values() );


    // ==========================================
    // SORT BY BOOKMARKS
    // ==========================================

    recipes.sort((a, b) => { return b.numberBookmarks - a.numberBookmarks; });


    // ==========================================
    // GLOBAL TOP N
    // ==========================================

    const globalTopBookmarked = recipes
        .slice(0, topN)
        .map((item, index) => ({
            position: index + 1,
            recipe: item.recipe,
            creator: item.recipe.creator,
            numberBookmarks: item.numberBookmarks
        }));


    // ==========================================
    // USER RECIPES
    // ==========================================
    const userRecipes = recipes.filter(item => item.recipe.creator && item.recipe.creator._id.toString() === userId.toString() );


    // ==========================================
    // USER TOP N
    // ==========================================

    const userTopBookmarked = userRecipes
        .slice(0, topN)
        .map((item, index) => ({
            position: index + 1,
            recipe: item.recipe,
            creator: item.recipe.creator,
            numberBookmarks: item.numberBookmarks
        }));


    // ==========================================
    // USER BEST GLOBAL POSITION
    // ==========================================

    let userBestBookmarked = null;

    if (userRecipes.length > 0) {

        const bestUserRecipe = userRecipes[0];
        const globalIndex = recipes.findIndex(item => item.recipe._id.toString() === bestUserRecipe.recipe._id.toString() );

        if (globalIndex !== -1) {

            userBestBookmarked = {
                position: globalIndex + 1,
                recipe: bestUserRecipe.recipe,
                creator: bestUserRecipe.recipe.creator,
                numberBookmarks: bestUserRecipe.numberBookmarks
            };

        }

    }


    // ==========================================
    // RETURN
    // ==========================================

    return {
        period,
        topN,
        userTopBookmarked,
        globalTopBookmarked,
        userBestBookmarked
    };
};


const getCategoryStatisticsService = async (topN, period) => {

    topN = Number(topN);
    period = Number(period);

    if (!Number.isInteger(topN) || topN < 1) { topN = 5;}
    if (!Number.isInteger(period) || period < 1) { period = 1;}


    // ==========================================
    // DATE RANGE
    // ==========================================

    const fromDate = new Date();

    fromDate.setDate(
        fromDate.getDate() - (30 * period)
    );


    // ==========================================
    // PUBLIC RECIPES
    // ==========================================

    const recipes = await recepieModel
        .find({
            visibility: visibility.PUBLIC
        })
        .select("_id category")
        .lean();


    // ==========================================
    // RECIPE -> CATEGORY MAP
    // ==========================================

    const recipeCategories = new Map();

    for (const recipe of recipes) {

        recipeCategories.set(
            recipe._id.toString(),
            recipe.category || []
        );

    }


    // ==========================================
    // RATINGS FROM SELECTED PERIOD
    // ==========================================

    const ratings = await ratingModel
        .find({
            createdAt: {
                $gte: fromDate
            }
        })
        .select("rated rating")
        .lean();


    // ==========================================
    // CATEGORY RATINGS
    // ==========================================

    const categoryRatings = new Map();

    for (const rating of ratings) {

        if (!rating.rated) {
            continue;
        }

        const recipeId =
            rating.rated.toString();

        const categories =
            recipeCategories.get(recipeId);

        if (!categories) {
            continue;
        }

        const ratingValue =
            Number(rating.rating);

        if (Number.isNaN(ratingValue)) {
            continue;
        }


        for (const category of categories) {

            if (!categoryRatings.has(category)) {

                categoryRatings.set(category, []);

            }

            categoryRatings
                .get(category)
                .push(ratingValue);

        }

    }


    // ==========================================
    // BOOKMARKS FROM SELECTED PERIOD
    // ==========================================

    const bookmarks = await bookmarkModel
        .find({
            createdAt: {
                $gte: fromDate
            }
        })
        .select("recepie")
        .lean();


    // ==========================================
    // CATEGORY BOOKMARKS
    // ==========================================

    const categoryBookmarks = new Map();

    for (const bookmark of bookmarks) {

        if (!bookmark.recepie) {
            continue;
        }

        const recipeId =
            bookmark.recepie.toString();

        const categories =
            recipeCategories.get(recipeId);

        if (!categories) {
            continue;
        }


        for (const category of categories) {

            if (!categoryBookmarks.has(category)) {

                categoryBookmarks.set(category, 0);

            }

            categoryBookmarks.set(
                category,
                categoryBookmarks.get(category) + 1
            );

        }

    }


    // ==========================================
    // COMBINE CATEGORIES
    // ==========================================

    const categoryNames = new Set([
        ...categoryRatings.keys(),
        ...categoryBookmarks.keys()
    ]);


    const categories = Array.from(categoryNames)
        .map(category => {

            const ratingValues =
                categoryRatings.get(category) || [];

            const totalBookmarks =
                categoryBookmarks.get(category) || 0;


            let averageRating = 0;

            if (ratingValues.length > 0) {

                const sum = ratingValues.reduce(
                    (total, value) =>
                        total + value,
                    0
                );

                averageRating =
                    sum / ratingValues.length;

            }


            return {
                category,
                averageRating: Number(averageRating.toFixed(2)),
                totalBookmarks
            };

    });


    // ==========================================
    // HOTTEST BY RATING
    // ==========================================

    const byRating = [...categories]
        .sort(
            (a, b) =>
                b.averageRating -
                a.averageRating
        )
        .slice(0, topN)
        .map((category, index) => ({
            position: index + 1,
            ...category
        }));


    // ==========================================
    // HOTTEST BY BOOKMARKS
    // ==========================================

    const byBookmarks = [...categories]
        .sort(
            (a, b) =>
                b.totalBookmarks -
                a.totalBookmarks
        )
        .slice(0, topN)
        .map((category, index) => ({
            position: index + 1,
            ...category
        }));


    // ==========================================
    // RETURN
    // ==========================================

    return {
        period,
        topN,
        rating: byRating,
        bookmarks: byBookmarks
    };
};


export {
    getSummaryStatisticsService,
    getRatingStatisticsService,
    getBookmarkStatisticsService,
    getCategoryStatisticsService,

}