import commentModel from "../model/comment.model.js"
import reviewModel from "../model/review.model.js"
import userModel from "../model/user.model.js";


const getCommentsService = async (user, reviewId, skip, limit)=>{
    const review = await reviewModel.find({_id: reviewId});
    if(!review){
        return {
            "msg": "review doesnt exist",
            "statusCode": 404
        };
    }

    const comments = await commentModel.find({review: reviewId})
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit)
                                .populate("user","name");

    const commentsNumber = await commentModel.countDocuments({review: reviewId});

    let moreAvailable = true;

    if (commentsNumber <= skip + comments.length) {
        moreAvailable = false;
    }


    return {
        "msg":"comments fetched succesfully",
        "statusCode": 200,
        "comments": comments,
        "moreAvailable": moreAvailable

    }
}


const likeCommentService = async (user, comment) => {

    const existingComment = await commentModel.findById(comment);

    if (!existingComment) {
        return {
            msg: "comment doesnt exist",
            statusCode: 404
        };
    }

    const alreadyLiked = existingComment.liker.some(
        id => id.toString() === user.toString()
    );

    if (alreadyLiked) {

        existingComment.liker = existingComment.liker.filter(
            id => id.toString() !== user.toString()
        );

    } else {

        existingComment.disliker = existingComment.disliker.filter(
            id => id.toString() !== user.toString()
        );

        existingComment.liker.push(user);
    }

    await existingComment.save();

    return {
        msg: "succesfully changed like",
        statusCode: 200
    };
};


const dislikeCommentService = async (user, comment) => {

    const existingComment = await commentModel.findById(comment);

    if (!existingComment) {
        return {
            msg: "comment doesnt exist",
            statusCode: 404
        };
    }

    const alreadyDisliked = existingComment.disliker.some(
        id => id.toString() === user.toString()
    );

    if (alreadyDisliked) {

        existingComment.disliker = existingComment.disliker.filter(
            id => id.toString() !== user.toString()
        );

    } else {

        existingComment.liker = existingComment.liker.filter(
            id => id.toString() !== user.toString()
        );

        existingComment.disliker.push(user);
    }

    await existingComment.save();

    return {
        msg: "succesfully changed dislike",
        statusCode: 200
    };
};


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
    const existingUser = await userModel.findOne({_id:user}).populate("role"); 
    
    if(!findComment){
        return{
            "msg": "there is no comment",
            "statusCode": 404
        }
    }
    
    if(findComment.user != user && existingUser.role.roleName !== "contentManager" && existingUser.role.roleName !== "admin"){
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
    deleteCommentsService,
    getCommentsService,
    likeCommentService,
    dislikeCommentService
}