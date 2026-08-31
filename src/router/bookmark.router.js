import e from "express"
import { createBookmark, deleteBookmark } from "../controller/bookmark.controller.js";

const bookmarkRouter = e.Router();

bookmarkRouter.post("/", createBookmark);
bookmarkRouter.delete("/", deleteBookmark);

export default bookmarkRouter;