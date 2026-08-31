import commentModel from "../model/comment.model.js"
import reviewModel from "../model/review.model.js"

const createCommentService = async(user, review, text)=>{
    const existingReview = await reviewModel.findOne({_id: review});
    if(!existingReview){
        return {
            "msg": "the review that you're traying to comment on doesn't exit",
            "statusCode": 404
        }
    } 
    const comment = new commentModel({
        user: user,
        review: review,
        text: text,
        liker: [],
        disliker: []
    });
    await comment.save();

    return {
        "msg": "the comment on the review was succesfull",
        "statusCode": 200
    }
}

const editCommentService = async(id, text, user)=>{
    const comment = await commentModel.findOne({_id: id})
    if(!comment){
        return  {
            "msg": "the comment that youre trying to edit doesn't exist",
            "statusCode": 404
        }
    }
    
    comment.text = text;

    await comment.save();

    return {
        "msg": "the comment has been modifyed", 
        "statusCode": 200
    }
    
}

const deleteCommentService = async(comment, user)=>{
    const findComment = await commentModel.findOne({_id: comment}); 
    if(!findComment){
        return{
            "msg": "there is no comment",
            "statusCode": 404
        }
    }
    if(findComment.user != user){
        return{
            "msg": "you are not the owner of this comment",
            "statusCode": 405
        }
    }

    await findComment.deleteOne();

    return {
        "msg": "the comment has been deleted",
        "statusCode": 200
    }

}

const deleteCommentsService = async(comments)=>{
    const result = await commentModel.deleteMany({ _id: {$in: comments}});

    if(result.deletedCount === comments.length){
        return {
            "success": true,
        }
    }
    return {
        "success": false
    }
}
export {
    createCommentService,
    editCommentService,
    deleteCommentService,
    deleteCommentsService
}