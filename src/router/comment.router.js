import e from "express"
import { createComment, editComment, deleteComment } from "../controller/comment.controller.js";

const commentRouter = e.Router();

commentRouter.post("/", createComment);
commentRouter.put("/:id", editComment);
commentRouter.delete("/:id", deleteComment);

export default commentRouter;