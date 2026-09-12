import { hasUserBookmarkedThisService, 
         getRecepieReviewsService, 
         createRecepieService, 
         getRecepieService, 
         deleteRecepieService, 
         editRecepieService,
         getUsersRatingForRecepieService,
         getAllRecepiesService
         } from "../service/recepie.service.js"
import { idSchema } from "../utils/validation.js"
import { recepieSchema, editRecepieSchema } from "../utils/recepie.validation.js";

const createRecepie = async(req, res)=>{
    const name = req.body.name;
    const preparationTime = req.body.preparationTime;
    const cookingTime = req.body.cookingTime;
    const category = req.body.category;
    const cuisine = req.body.cuisine;
    const ingredients = req.body.ingredients;
    const instructions = req.body.instructions;
    const cookingMethods = req.body.cookingMethods;
    const tools = req.body.tools;
    const nutrition = req.body.nutrition;
    const imageUrl = req.body.imageUrl;
    const visibility = req.body.visibility;
    const creator = req.user._id;


    const val = await recepieSchema.parse({
                                        name: name, 
                                        preparationTime: preparationTime,
                                        cookingTime: cookingTime,
                                        category: category,
                                        cuisine: cuisine,
                                        ingredients: ingredients,
                                        instructions: instructions,
                                        cookingMethods: cookingMethods,
                                        tools: tools,
                                        nutrition: nutrition,
                                        imageUrl: imageUrl,
                                        creator: creator,
                                        visibility: visibility
                                    })

    const result = await createRecepieService(
                                            name, 
                                            preparationTime,
                                            cookingTime,
                                            category,
                                            cuisine,
                                            ingredients,
                                            instructions,
                                            cookingMethods,
                                            tools,
                                            nutrition,
                                            imageUrl,
                                            creator,
                                            visibility
                                    )

    return res.status(result.statusCode).json({
        "msg": result.msg,
        "id": result.id
    })
}

const editRecepie = async(req, res)=>{
    const recepieId =  req.params.id
    const name = req.body.name;
    const preparationTime = req.body.preparationTime;
    const cookingTime = req.body.cookingTime;
    const category = req.body.category;
    const cuisine = req.body.cuisine;
    const ingredients = req.body.ingredients;
    const instructions = req.body.instructions;
    const cookingMethods = req.body.cookingMethods;
    const tools = req.body.tools;
    const nutrition = req.body.nutrition;
    const imageUrl = req.body.imageUrl;
    const visibility = req.body.visibility;
    const creator = req.user._id;



    const val = await editRecepieSchema.parse({
                                        _id: recepieId,
                                        name: name, 
                                        preparationTime: preparationTime,
                                        cookingTime: cookingTime,
                                        category: category,
                                        cuisine: cuisine,
                                        ingredients: ingredients,
                                        instructions: instructions,
                                        cookingMethods: cookingMethods,
                                        tools: tools,
                                        nutrition: nutrition,
                                        imageUrl: imageUrl,
                                        creator: creator,
                                        visibility: visibility
                                    })

    const result = await editRecepieService(
                                            recepieId,
                                            name, 
                                            preparationTime,
                                            cookingTime,
                                            category,
                                            cuisine,
                                            ingredients,
                                            instructions,
                                            cookingMethods,
                                            tools,
                                            nutrition,
                                            imageUrl,
                                            creator,
                                            visibility
                                    )

    return res.status(result.statusCode).json({
        "msg": result.msg
    })

}

const getRecepie = async(req, res)=>{
    const recepieId = req.params.id;

    const val = await idSchema.parse({_id: recepieId});

    const result = await getRecepieService(recepieId);

    return res.status(result.statusCode).json({
        "msg": result.msg,
        "recepie": result.recepie
    })
}

const deleteRecepie = async(req, res)=>{
    const recepieId = req.params.id;
    const user = req.user._id;

    const val = idSchema.parse({_id: recepieId});

    const result = await deleteRecepieService(recepieId, user);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const hasUserBookmarkedThis = async(req, res)=>{
    const recepie = req.params.id;
    const user = req.user._id;

    const val = await idSchema.parse({_id:recepie});

    const response = await hasUserBookmarkedThisService(recepie, user);

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "bookmarks": response.bookmarks
    })
}

const getRecepieReviews = async(req, res)=>{
    const recepie = req.params.id;

    const pageNumber = parseInt(req.query.pageNumber); 
    const pageSize = parseInt(req.query.pageSize);

    const val = await idSchema.parse({_id: recepie});

    const response = await getRecepieReviewsService(recepie, pageNumber, pageSize);

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })
} 

const getUsersRatingForRecepie = async(req, res)=>{
    const user = req.user._id;
    const recepieId = req.params.id;

    const val = await idSchema.parse({_id: recepieId})

    const response = await getUsersRatingForRecepieService(user, recepieId)

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })
}

const getAllRecepies = async(req, res)=>{

    
        const pageNumber = parseInt(req.query.pageNumber);
        const pageSize = parseInt(req.query.pageSize);

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
        filter = {
            ...filter,
            visibility: "public"
        }

    const response = await getAllRecepiesService(pageNumber, pageSize, filter, req.user._id);
    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })

}



export {
    createRecepie,
    editRecepie,
    getRecepie,
    deleteRecepie,
    hasUserBookmarkedThis,
    getRecepieReviews,
    getUsersRatingForRecepie,
    getAllRecepies
}
