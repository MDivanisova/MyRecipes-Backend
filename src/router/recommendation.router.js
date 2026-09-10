import express from "express";
import {getRecommendationsController} from "../controller/recommendation.controller.js";

const recommendationRouter = express.Router();


recommendationRouter.get("/", getRecommendationsController);


export default recommendationRouter;