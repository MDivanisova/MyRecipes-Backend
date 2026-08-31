import { createRatingService, deleteRatingService, editRatingService } from "../service/rating.service.js"
import { idSchema } from "../utils/validation.js"
import { editRatingSchema, ratingSchema } from "../utils/rating.validation.js"


const createRating = async(req, res)=>{
    const rating = req.body.rating;
    const rater = req.user._id;
    const rated = req.body.rated;

    const val = await ratingSchema.parse({rating: rating, rater: rater, rated: rated});

    const result = await createRatingService(rating, rater, rated);
    
    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const editRating = async(req, res)=>{
    const ratingId = req.params.id;
    const rating = req.body.rating;
    const rater = req.user._id;
    
    const val = await editRatingSchema.parse({ratingId: ratingId, rating: rating})

    const result = await editRatingService(ratingId, rating, rater)

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const deleteRating = async(req, res)=>{
    const ratingId = req.params.id;
    
    const val = await idSchema.parse({_id: ratingId});

    const result = await deleteRatingService(ratingId);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

export {
    createRating,
    editRating,
    deleteRating
}