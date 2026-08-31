import commentModel from "../model/comment.model.js"
import recepieModel from "../model/recepie.model.js"
import reviewModel from "../model/review.model.js"
import userModel from "../model/user.model.js"
import { deleteCommentsService } from "./comment.service.js"


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

const editReviewService = async(review, text, reviewer)=>{
    const existingReview = await reviewModel.findOne({_id: review})
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
    if(!existingReview){
        return{
            "msg": "there is no review",
            "statusCode": 404
        }
    }
    if(existingReview.reviewer != user){
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
    const existingUser = await userModel.findOne({_id: user})
        
        if(!existingUser){
            return{ 
                "msg": "user dose not exist",
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
    deleteReviewsService
}