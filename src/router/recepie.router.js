import e from "express"
import { createRecepie, getRecepie, editRecepie, deleteRecepie, hasUserBookmarkedThis, getRecepieReviews, getUsersRatingForRecepie, getAllRecepies } from "../controller/recepie.controller.js";

const recepieRouter = e.Router();

recepieRouter.post("/", createRecepie);

recepieRouter.get("/recepies",getAllRecepies);

recepieRouter.get("/:id", getRecepie);
recepieRouter.put("/:id", editRecepie);
recepieRouter.delete("/:id", deleteRecepie);
recepieRouter.get("/:id/bookmarks", hasUserBookmarkedThis);
recepieRouter.get("/:id/reviews", getRecepieReviews);
recepieRouter.get("/:id/rating", getUsersRatingForRecepie);


export default recepieRouter;