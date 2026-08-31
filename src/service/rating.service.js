import ratingModel from "../model/rating.model.js"
import recepieModel from "../model/recepie.model.js"
import { createRatingForRecepieService } from "./recepie.service.js"

const createRatingService = async(rating, rater, rated)=>{
    const existingRating = await ratingModel.findOne({rater: rater, rated: rated}) 
    const existingRecepie = await recepieModel.findOne({_id: rated})
    if(!existingRecepie){
        return{
            "msg": "recepie doesn't exist",
            "statusCode": 404
        }
    }
    if(existingRating){
        return {
            "msg": "this recepie is already rated by the user",
            "statusCode": 404
        }
    }

    const newRating = new ratingModel({
        rating: rating,
        rater: rater,
        rated: rated
    })

    await newRating.save();

    await createRatingForRecepieService(rated);

    return {
        "msg": "rating has been succesfully made",
        "statusCode": 200
    }
}

const editRatingService = async(ratingId, rating, rater)=>{
    const existingRating = await ratingModel.findOne({_id: ratingId})
    if(!existingRating){
        return{
            "msg": "user didnt rate the recepie",
            "statusCode": 404
        }
    }
    if(existingRating.rater != rater){
        return{
            "msg": "you are not the owner of the rating",
            "statusCode": 409
        }
    } 
    const existingRecepie = await recepieModel.findOne({_id: existingRating.rated})
    if(!existingRecepie){
        return{
            "msg": "recepie doesn't exist",
            "statusCode": 404
        }
    }

    existingRating.rating = rating;
    await existingRating.save();

    await createRatingForRecepieService(existingRating.rated);

    return{
        "msg": "youre rating on this recepie has been changed",
        "statusCode": 200
    }
}

const deleteRatingService = async(ratingId)=>{
    const existingRating = await ratingModel.findOne({_id: ratingId})

     if(!existingRating){
        return{
            "msg": "rating that you're trying to delete doesn't exist ",
            "statusCode": 404
        }
    }
    const existingRecepie = await recepieModel.findOne({_id: existingRating.rated})

    if(!existingRecepie){
        return{
            "msg": "recepie doesn't exist",
            "statusCode": 404
        }
    }
    let rated = existingRating.rated;
    await existingRating.deleteOne();

    await createRatingForRecepieService(rated);
    return {
        "msg": "rating has been deleted",
        "statusCode": 200
    }
    
}

const deleteRatingsService = async (ratings) =>{
    const result = await ratingModel.deleteMany({_id: {$in: ratings}});

     if(result.deletedCount === ratings.length){
        return {
            "success": true,
        }
    }
    return {
        "success": false
    }
}

export {
    createRatingService,
    editRatingService,
    deleteRatingService,
    deleteRatingsService
}