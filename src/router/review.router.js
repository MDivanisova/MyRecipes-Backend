import e from "express";
import { createReview, editReview, deleteReview, getReviews, likeReview, dislikeReview } from "../controller/review.controller.js";

const reviewRouter = e.Router();

reviewRouter.post("/", createReview);
reviewRouter.put("/like/:id", likeReview);
reviewRouter.put("/dislike/:id", dislikeReview);
reviewRouter.get("/:id", getReviews);
reviewRouter.put("/:id", editReview);
reviewRouter.delete("/:id", deleteReview);


export default reviewRouter;