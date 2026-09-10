import e from "express";
import { getSummaryStatistics, getRatingStatistics, getBookmarkStatistics, getCategoryStatistics } from "../controller/statistic.controller.js";



const statisticRouter = e.Router();


statisticRouter.get("/summary", getSummaryStatistics);
statisticRouter.get("/rating", getRatingStatistics);
statisticRouter.get("/bookmark", getBookmarkStatistics);
statisticRouter.get("/category", getCategoryStatistics);

export default statisticRouter;