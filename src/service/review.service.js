import commentModel from "../model/comment.model.js"
import recepieModel from "../model/recepie.model.js"
import reviewModel from "../model/review.model.js"
import userModel from "../model/user.model.js"
import ratingModel from "../model/rating.model.js"
import { deleteCommentsService } from "./comment.service.js"




const getReviewsSerivice = async (recipeId, skip, limit, userId, ratingFilter) => {

    const existingRecepie = await recepieModel.findOne({
        _id: recipeId
    });

    if (!existingRecepie) {
        return {
            "msg": "recepie doesnt exist",
            "statusCode": 404
        };
    }


    let ratingQuery = {
        rated: recipeId,
        rater: {
            $ne: userId
        }
    };


    if (Number(ratingFilter) !== 0) {
        ratingQuery.rating = Number(ratingFilter);
    }


    const totalRatings = await ratingModel.countDocuments(ratingQuery);


    const ratings = await ratingModel
        .find(ratingQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);


    const reviewerIds = ratings.map((rating) => rating.rater);


    const reviews = await reviewModel
        .find({
            reviewed: recipeId,
            reviewer: {
                $in: reviewerIds
            }
        })
        .populate("reviewer", "name");


    const reviewsWithRatings = reviews.map((review) => {

        const rating = ratings.find(
            (rating) =>
                rating.rater.toString() === review.reviewer._id.toString()
        );

        return {
            ...review.toObject(),
            rating: rating ? rating.rating : null
        };

    });


    let moreAvailable = true;

    if (totalRatings <= skip + ratings.length) {
        moreAvailable = false;
    }


    return {
        "reviews": reviewsWithRatings,
        "statusCode": 200,
        "moreAvailable": moreAvailable
    };
};

const createReviewService = async(reviewer, reviewed, text)=>{
    const existingRecepie = await recepieModel.findOne({_id: reviewed});
    if(!existingRecepie){
        return{
            "msg": "recepie doesnt exist",
            "statusCode": 404
        }
    }
    
    const existsReview = await reviewModel.findOne({reviewer: reviewer, reviewed: reviewed})
    if(existsReview){
        return{
            "msg": "user already left a review",
            "statusCode": 409
        }
    }
    const existingUser = await userModel.findOne({_id: reviewer})
        
        if(!existingUser){
            return{ 
                "msg": "user dose not exist",
                "statusCode": 404
            }
        }

    const review = new reviewModel({
        reviewer: reviewer,
        reviewed: reviewed,
        text: text,
        comments: [],
        liker: [],
        disliker: []
    });

    await review.save();

    existingUser.reviewsWriten++;
    existingUser.save()

    existingRecepie.numberReviews++;
    await existingRecepie.save();


    return {
        "msg": "the review was succesfull",
        "statusCode": 200
    }
}

const likeReviewService = async (user, review) => {

    const existingReview = await reviewModel.findById(review);

    if (!existingReview) {
        return {
            msg: "review doesnt exist",
            statusCode: 404
        };
    }

    const alreadyLiked = existingReview.liker.some(
        id => id.toString() === user.toString()
    );

    if (alreadyLiked) {

        existingReview.liker = existingReview.liker.filter(
            id => id.toString() !== user.toString()
        );

    } else {

        existingReview.disliker = existingReview.disliker.filter(
            id => id.toString() !== user.toString()
        );

        existingReview.liker.push(user);
    }

    await existingReview.save();

    return {
        msg: "succesfully changed like",
        statusCode: 200
    };
};


const dislikeReviewService = async (user, review) => {

    const existingReview = await reviewModel.findById(review);

    if (!existingReview) {
        return {
            msg: "review doesnt exist",
            statusCode: 404
        };
    }

    const alreadyDisliked = existingReview.disliker.some(
        id => id.toString() === user.toString()
    );

    if (alreadyDisliked) {

        existingReview.disliker = existingReview.disliker.filter(
            id => id.toString() !== user.toString()
        );

    } else {

        existingReview.liker = existingReview.liker.filter(
            id => id.toString() !== user.toString()
        );

        existingReview.disliker.push(user);
    }

    await existingReview.save();

    return {
        msg: "succesfully changed dislike",
        statusCode: 200
    };
};

const editReviewService = async(review, text, reviewer)=>{
    const existingReview = await reviewModel.findOne({_id: review});

    if(!existingReview){
        return  {
            "msg": "the review that youre trying to edit doesn't exist",
            "statusCode": 404
        }
    }
    if(existingReview.reviewer != reviewer){
        return{
            "msg": "you are not the owner of this review",
            "statusCode": 405
        }
    }

    existingReview.text = text;

    await existingReview.save();

    return {
        "msg": "the review has been modifyed", 
        "statusCode": 200
    }
    
}

const deleteReviewService = async(review, user)=>{

    const existingReview = await reviewModel.findOne({_id: review}).populate('comments'); 
    const existingUser = await userModel.findOne({_id:user}).populate("role"); 

    if(!existingUser){
            return{ 
                "msg": "user dose not exist",
                "statusCode": 404
            }
    
        }
    if(!existingReview){
        return{
            "msg": "there is no review",
            "statusCode": 404
        }
    }
    if(existingReview.reviewer != user && existingUser.role.roleName !== "contentManager" && existingUser.role.roleName !== "admin"){
        return{
            "msg": "you are not the owner of this review",
            "statusCode": 405
        }
    }

    const existingRecepie = await recepieModel.findOne({_id: existingReview.reviewed});
    if(!existingRecepie){
        return{
            "msg": "recepie doesnt exist",
            "statusCode": 404
        }
    }

    const deletedComments = await deleteCommentsService(existingReview.comments);
    if(!deletedComments.success){
        return {
            "msg": "some of the comments for this review were not deleted",
            "statusCode": 404,
            "comments": existingReview.comments
        }
    }
    await existingReview.deleteOne();
    
    existingRecepie.reviewsWriten--;
    await existingRecepie.save();

    existingUser.numberReviews--;
    existingUser.save()

    return {
        "msg": "the review has been deleted",
        "statusCode": 200
    }

}

const deleteReviewsService = async(reviews)=>{
    const res = await commentModel.deleteMany({review: {$in: reviews}})
    const result = await reviewModel.deleteMany({ _id: {$in: reviews}});
    
        if(result.deletedCount === reviews.length){
            return {
                "success": true,
            }
        }
        return {
            "success": false
        }
}

export {
    createReviewService,
    editReviewService,
    deleteReviewService,
    deleteReviewsService,
    getReviewsSerivice,
    likeReviewService,
    dislikeReviewService
}