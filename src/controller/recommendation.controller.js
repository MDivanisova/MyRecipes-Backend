import {getRecommendationsService} from "../service/recommendation.service.js"


export const getRecommendationsController =
    async (req, res) => {

        const userId = req.user._id;

        const recommendations =
            await getRecommendationsService(
                userId,
                4
            );


        return res.status(200).json({
            msg: "Recommendations retrieved successfully",
            "recommendations": recommendations
        });
    };