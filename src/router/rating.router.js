import e from "express"
import { createRating, editRating, deleteRating, getRating, getRatingStatistics } from "../controller/rating.controller.js";

const ratingRouter = e.Router();

ratingRouter.post("/", createRating);
ratingRouter.get("/statistics/:id", getRatingStatistics);
ratingRouter.get("/:id", getRating);
ratingRouter.put("/:id", editRating);
ratingRouter.delete("/:id", deleteRating);

export default ratingRouter;