import e from "express"
import { createRating, editRating, deleteRating } from "../controller/rating.controller.js";

const ratingRouter = e.Router();

ratingRouter.post("/", createRating);
ratingRouter.put("/:id", editRating);
ratingRouter.delete("/:id", deleteRating);

export default ratingRouter;