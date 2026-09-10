import { getSummaryStatisticsService, getRatingStatisticsService, getBookmarkStatisticsService, getCategoryStatisticsService } from "../service/statistic.service.js";



const getSummaryStatistics = async (req, res) => {

    const userId = req.user._id;

    const summary = await getSummaryStatisticsService(userId);

    return res.status(200).json({
        summary
    });
};



const getRatingStatistics = async (req, res) => {

        const userId = req.user._id;
        const { period, topN } = req.query;

        const statistics = await getRatingStatisticsService(userId, topN, period);


        return res.status(200).json({
            statistics
        });
    
};



const getBookmarkStatistics = async (req, res) => {

    const userId = req.user._id;
    const { period, topN } = req.query;

    const statistics = await getBookmarkStatisticsService(userId,topN, period);
    

    return res.status(200).json({
        statistics
    });
};



const getCategoryStatistics = async (req, res) => {
    const { period, topN } = req.query;

    const categories = await getCategoryStatisticsService(topN, period);

    return res.status(200).json({
        categories
    });
};



export {
    getSummaryStatistics,
    getRatingStatistics,
    getBookmarkStatistics,
    getCategoryStatistics
};
