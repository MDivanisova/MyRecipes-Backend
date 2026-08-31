import { reviewSchema, editReviewSchema } from "../utils/review.validation.js"
import { idSchema } from "../utils/validation.js"
import { createReviewService, editReviewService, deleteReviewService } from "../service/review.service.js"

const createReview = async(req, res)=>{
    const reviewer = req.user._id;
    const reviewed = req.body.reviewed;
    const text = req.body.text;

    const val = await reviewSchema.parse({reviewer: reviewer, reviewed: reviewed, text: text});

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

//getAllReviews treba aaaaa


export {
    createReview,
    deleteReview,
    editReview,
}