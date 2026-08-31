import e from "express";
import { createReview, editReview, deleteReview } from "../controller/review.controller.js";

const reviewRouter = e.Router();

reviewRouter.post("/", createReview);
reviewRouter.put("/:id", editReview);
reviewRouter.delete("/:id", deleteReview);


export default reviewRouter;