import { reviewSchema, editReviewSchema } from "../utils/review.validation.js"
import { idSchema } from "../utils/validation.js"
import { createReviewService, editReviewService, deleteReviewService, getReviewsSerivice, likeReviewService, dislikeReviewService } from "../service/review.service.js"


const getReviews = async (req, res)=>{
    const recipeId = req.params.id;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    const ratingFilter = parseInt(req.query.ratingFilter);
    const userId = req.user._id;


    const val = idSchema.parse({_id: recipeId});

    const result = await getReviewsSerivice(recipeId, skip, limit, userId, ratingFilter);

    return res.status(result.statusCode).json({
        "msg":"reviews fetched",
        "reviews": result.reviews,
        "moreAvailable": result.moreAvailable
    })
}

const likeReview = async (req, res) =>{
    const user = req.user._id;
    const review = req.params.id;
    
    const val = idSchema.parse({_id:review});
    
    const response = await likeReviewService(user, review);
    
    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const dislikeReview = async (req, res) =>{
    const user = req.user._id;
    const review = req.params.id;
    
    const val = idSchema.parse({_id:review});
    
    const response = await dislikeReviewService(user, review);
    
    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const createReview = async(req, res)=>{
    const reviewer = req.user._id;
    const reviewed = req.body.reviewed;
    const text = req.body.text;

    const val = reviewSchema.parse({reviewer: reviewer, reviewed: reviewed, text: text});

    const result = await createReviewService(reviewer, reviewed, text);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const editReview = async(req, res)=>{
    const review = req.params.id;
    const text = req.body.text;
    const reviewer = req.user._id;

    const val = await editReviewSchema.parse({_id: review, text: text});

    const result = await editReviewService(review, text, reviewer);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const deleteReview = async(req, res)=>{
    const review = req.params.id;
    const user = req.user._id;

    const val = await idSchema.parse({_id: review});

    const response = await deleteReviewService(review, user);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

export {
    createReview,
    deleteReview,
    editReview,
    getReviews,
    likeReview,
    dislikeReview
}