import bookmarkModel from "../model/bookmark.model.js"
import ratingModel from "../model/rating.model.js";
import recepieModel from "../model/recepie.model.js";
import reviewModel from "../model/review.model.js";
import { deleteBookmarksService } from "./bookmark.service.js";
import { deleteRatingsService } from "./rating.service.js";
import { deleteReviewsService } from "./review.service.js";

const createRecepieService = async(name, 
                                   preparationTime,
                                   cookingTime,
                                   category,
                                   cuisine,
                                   ingredients,
                                   instructions,
                                   cookingMethods,
                                   tools,
                                   nutrition,
                                   imageUrl,
                                   creator,
                                   visibility)=>
    {

        nutrition.calories = `${nutrition.calories} kcal`;
        nutrition.carbohydrates = `${nutrition.carbohydrates} g`;
        nutrition.fiber = `${nutrition.fiber} g`;
        nutrition.protein = `${nutrition.protein} g`;
        nutrition.saturatedFat = `${nutrition.saturatedFat} g`;
        nutrition.sugar = `${nutrition.sugar} g`;
        nutrition.fat = `${nutrition.fat} g`;
        nutrition.unsaturatedFat = `${nutrition.unsaturatedFat} g`;
        nutrition.sodium = `${nutrition.sodium} mg`;
        nutrition.cholesterol = `${nutrition.cholesterol} mg`;



        const newRecepie = new recepieModel({
                                        name: name, 
                                        preparationTime: preparationTime,
                                        cookingTime: cookingTime,
                                        category: category,
                                        cuisine: cuisine,
                                        ingredients: ingredients,
                                        instructions: instructions,
                                        cookingMethods: cookingMethods,
                                        tools: tools,
                                        nutrition: nutrition,
                                        imageUrl: imageUrl,
                                        creator: creator,
                                        rating: 0.0,
                                        numberBookmarks: 0,
                                        numberReviews: 0,
                                        visibility: visibility
        })

        await newRecepie.save();

        return{
            "msg": "recepie successfuly created",
            "statusCode": 200,
            "id": newRecepie._id
        }
}

const editRecepieService = async(recepieId,
                                name, 
                                preparationTime,
                                cookingTime,
                                category,
                                cuisine,
                                ingredients,
                                instructions,
                                cookingMethods,
                                tools,
                                nutrition,
                                imageUrl,
                                creator,
                                visibility)=>{

    const existingRecepie = await recepieModel.findOne({_id: recepieId})
    if(existingRecepie.creator != creator){
        return{
            "msg": "you are not the owner of this recepie",
            "statusCode": 403
        } 
    }
    if(!existingRecepie){
        return{
            "msg": "recepie dose not exist",
            "statusCode": 404
        }
    }
    
    existingRecepie.name = name;
    existingRecepie.preparationTime = preparationTime;
    existingRecepie.cookingTime = cookingTime;
    existingRecepie.category = category;
    existingRecepie.cuisine = cuisine;
    existingRecepie.ingredients = ingredients;
    existingRecepie.instructions = instructions;
    existingRecepie.cookingMethods = cookingMethods;
    existingRecepie.tools = tools;
    existingRecepie.nutrition = nutrition;
    existingRecepie.imageUrl = imageUrl;
    existingRecepie.visibility = visibility;

    await existingRecepie.save();

    return{
        "msg": "recepie successfuly modifyed",
        "statusCode": 200
    }
}

const getRecepieService = async(recepieId)=>{
    const existingRecepie = await recepieModel.findOne({_id: recepieId});
    if(!existingRecepie){
        return{
            "msg": "recepie doesn't exist",
            "statusCode": 404
        }
    }

    return{
        "msg": "recepie sucessfully fetch",
        "statusCode": 200,
        "recepie": existingRecepie
    }
}

const deleteRecepieService = async(recepieId, user)=>{
    const existingRecepie = await recepieModel.findOne({_id: recepieId});
    
    if(existingRecepie.creator != user){
        return{
            "msg": "you're not the owner of the recepie",
            "statusCode": 403
        }
    }

    if(!existingRecepie){
        return{
            "msg": "recepie doesn't exist",
            "statusCode": 404
        }
    }


    const reviews = await reviewModel.find({reviewed: recepieId});
    const bookmarks = await bookmarkModel.find({recepie: recepieId});
    const ratings = await ratingModel.find({rated: recepieId});

    await deleteReviewsService(reviews);
    await deleteBookmarksService(bookmarks);
    await deleteRatingsService(ratings);

    await existingRecepie.deleteOne();
    
    return{
        "msg": "recepie sucessfully deleted",
        "statusCode": 200
    }
}

const hasUserBookmarkedThisService = async(recepie, user)=>{
    const existingRecepie = await recepieModel.findOne({_id:recepie})
    if(!existingRecepie){
        return{
            "msg": "recepie doesnt exist",
            "statusCode": 404
        }
    }
    const bookmarkedRecepie = await bookmarkModel.findOne({recepie:recepie, user:user});

    if(!bookmarkedRecepie){
        return {
            "msg": "there is no bookmark for the recepie by this user",
            "statusCode": 404
        }
    }

    return {
        "msg": "here are the bookmark for the recepie by this user",
        "statusCode": 200,
        "bookmarks": bookmarkedRecepie
    }
}

const getRecepieReviewsService = async(recepie, pageNumber, pageSize)=>{
    const skip = (pageNumber - 1) * pageSize;
    const reviews = await reviewModel.find({reviewed: recepie})
                                    .skip(skip)
                                    .sort({createdAt: -1})
                                    .limit(pageSize)
                                    .populate({
                                        path:"reviewer"
                                    })
                                    .populate({
                                        path:"comments",
                                        populate: {
                                            path: "user",
                                            select:"name email gender"
                                        }
                                    });
    if(reviews.length === 0 ){ // treba da vrakja 200 ne 404 404 samo za ako recepie ne postoe za da mu trazeme reviews
        return {
            "msg": "no reviews for recepie",
            "statusCode": 200,
            "result": {
                reviews: [],
                pagination: {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
            }
        }    
    }

    return {
        "msg": "reviews were succesfully fetched for the recepie",
        "result": {
                reviews: reviews,
                pagination: {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
        },
        "statusCode": 200
    }
}

const createRatingForRecepieService = async(recepieId)=>{
    const recepie = await recepieModel.findOne({_id: recepieId});
    
    const ratings = await ratingModel.find({rated: recepieId})

    let sum = 0;
    for(let el of ratings){
        sum+=el.rating;
    }
    if(ratings.length){
        sum = sum / ratings.length * 1.0;
        recepie.rating = sum.toFixed(2);
    }
    else{
        recepie.rating = 0.0;
    }

    await recepie.save();

    return{
        "sucess": true
    }

}   

const getUsersRatingForRecepieService = async(user, recepieId)=>{
    const rating = await ratingModel.findOne({rater: user, rated: recepieId});
    if(!rating){
        return{
            "msg": "user didnt rate this recepie",
            "statusCode": 404
        }
    } 

    return {
        "msg": "users rating for this recepie has been succesfuly fetch",
        "statusCode": 200,
        "result": rating.rating
    }
}

const getAllRecepiesService = async (pageNumber, pageSize, filter, userId) => {

    const skip = (pageNumber - 1) * pageSize;

    const recepies = await recepieModel.find(filter)
                                        .populate("creator")
                                        .skip(skip)
                                        .limit(pageSize)
                                        .sort({ createdAt: -1 });


    const bookmarks = await bookmarkModel.find({ user:userId });


    const bookmarkedIds = bookmarks.map(bookmark =>
        bookmark.recepie.toString()
    );


    const recepiesWithBookmark = recepies.map(recepie => ({
        ...recepie.toObject(),

        isBookmarked: bookmarkedIds.includes(
            recepie._id.toString()
        )
    }));


    const numRecepies = await recepieModel.countDocuments(filter);

    const totalPages = Math.ceil(numRecepies / pageSize);


    return {
        msg: "recipes were successfully fetched",

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


export {
    hasUserBookmarkedThisService,
    getRecepieReviewsService,
    createRatingForRecepieService,
    createRecepieService,
    getRecepieService,
    deleteRecepieService,
    editRecepieService,
    getUsersRatingForRecepieService,
    getAllRecepiesService
}