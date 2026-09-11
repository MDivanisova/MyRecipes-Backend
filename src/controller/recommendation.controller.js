import {getAllRecommendationsService, makeRecommendedForAllUsers} from "../service/recommendation.service.js"


export const getRecommendationsController = async (req, res) => {

        const pageNumber = parseInt(req.query.pageNumber);
        const pageSize = parseInt(req.query.pageSize);
        const userId = req.user._id;

        let filter = {};

        if(req.query.name !== ""){
            filter = {
                ...filter,
                name: { $regex: `^${req.query.name}`, $options: "i" }
            }
        }
        if(req.query.creator !== ""){
            filter = {
                ...filter,
                creator: req.query.creator
            }
        }

        if(req.query.category !== "all"){
            filter = {
                ...filter,
                category: req.query.category
            }
        }

        if(req.query.cuisine !== "all"){
            filter = {
                ...filter,
                cuisine: req.query.cuisine
            }
        }

        if(req.query.ingredient !== "all"){
            filter = {
                ...filter,
                ingredients: {
                    $elemMatch: {
                        ingredient: {
                            $regex: `^${req.query.ingredient}`,
                            $options: "i"
                        }
                    }
                }
            }
        }

        const response = await getAllRecommendationsService(pageNumber, pageSize, userId, filter);


        return res.status(200).json({
            msg: "Recommendations retrieved successfully",
            "result": response.result
        });
    };

export const makeRecommendedController = async (req, res) => {
    
    const resp = await makeRecommendedForAllUsers(0.85);

    return res.status(200).json(resp);

}