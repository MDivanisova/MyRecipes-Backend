import express from "express";
import {getRecommendationsController, makeRecommendedController} from "../controller/recommendation.controller.js";
import { authMidler } from "../midler/user.midler.js";

const recommendationRouter = express.Router();


recommendationRouter.get("/", authMidler ,getRecommendationsController);
recommendationRouter.get("/makeRecommended", makeRecommendedController);

export default recommendationRouter;