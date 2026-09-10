import { createRatingService, deleteRatingService, editRatingService, getRatingService, getRatingStatisticsService } from "../service/rating.service.js"
import { idSchema } from "../utils/validation.js"
import { editRatingSchema, ratingSchema } from "../utils/rating.validation.js"


const getRating = async (req, res)=>{
    
    const userId = req.user._id;
    const recipeId = req.params.id;

    const val = idSchema.parse({_id:recipeId});

    const result = await getRatingService(userId, recipeId);

    return res.status(result.statusCode).json({
        "msg":result.msg,
        "rating": result.rating,
        "review": result.reviewe
    });
}

const createRating = async(req, res)=>{
    const rating = req.body.rating;
    const rater = req.user._id;
    const rated = req.body.rated;

    const val = ratingSchema.parse({rating: rating, rater: rater, rated: rated});

    const result = await createRatingService(rating, rater, rated);
    
    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const editRating = async(req, res)=>{
    const ratingId = req.params.id;
    const rating = req.body.rating;
    const rater = req.user._id;
    
    const val = editRatingSchema.parse({ratingId: ratingId, rating: rating})

    const result = await editRatingService(ratingId, rating, rater)

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const deleteRating = async(req, res)=>{
    const ratingId = req.params.id;
    
    const val = idSchema.parse({_id: ratingId});

    const result = await deleteRatingService(ratingId);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}



const getRatingStatistics = async (req, res) => {

    const recipeId = req.params.id;

    const val = idSchema.parse({_id: recipeId});

    const result = await getRatingStatisticsService(recipeId);

    return res.status(result.statusCode).json({
        "ratings": result.ratings
    });
}

export {
    createRating,
    editRating,
    deleteRating,
    getRating,
    getRatingStatistics
}