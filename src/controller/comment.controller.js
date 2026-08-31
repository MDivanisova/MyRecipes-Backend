import { createCommentService, editCommentService, deleteCommentService } from "../service/comment.service.js"
import { commentSchema, editCommentSchema } from "../utils/comment.validation.js";
import { idSchema } from "../utils/validation.js"

const createComment = async(req, res)=>{
    const user = req.user._id;
    const review = req.body.review;
    const text = req.body.text;

    const val = await commentSchema.parse({user:user, review:review, text:text});

    const response = await createCommentService(user, review, text);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const editComment = async(req, res)=>{
    const id = req.params.id;
    const text = req.body.text;
    const user = req.user._id;

    const val = await editCommentSchema.parse({_id: id, text: text});

    const response = await editCommentService(id, text, user);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const deleteComment = async(req, res)=>{
    const comment = req.params.id;
    const user = req.user._id;

    const val = await idSchema.parse({_id: comment});

    const response = await deleteCommentService(comment, user);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

export{
    createComment,
    editComment,
    deleteComment
}