import express from "express";
import {getRecommendationsController, makeRecommendedController} from "../controller/recommendation.controller.js";

const recommendationRouter = express.Router();


recommendationRouter.get("/", getRecommendationsController);
recommendationRouter.get("/makeRecommended", makeRecommendedController);

export default recommendationRouter;