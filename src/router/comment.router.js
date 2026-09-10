import e from "express"
import { createComment, editComment, deleteComment, getComments, likeComment, dislikeComment } from "../controller/comment.controller.js";

const commentRouter = e.Router();

commentRouter.post("/", createComment);
commentRouter.put("/like/:id", likeComment);
commentRouter.put("/dislike/:id", dislikeComment);
commentRouter.get("/:id", getComments);
commentRouter.put("/:id", editComment);
commentRouter.delete("/:id", deleteComment);

export default commentRouter;