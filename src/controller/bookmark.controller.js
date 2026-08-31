import { createBookmarkSchema } from "../utils/bookmark.validation.js";
import { createBookmarkService, deleteBookmarkService } from "../service/bookmark.service.js";
import { idSchema } from "../utils/validation.js"

const createBookmark = async(req, res)=>{
    const recepie = req.body.recepie;
    const user = req.user._id;

    const val = await createBookmarkSchema.parse({user:user, recepie:recepie});

    const response = await createBookmarkService(user, recepie);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const deleteBookmark = async(req, res)=>{
    const recepie = req.body.recepie;
    const user = req.user._id;

    const val = await idSchema.parse({_id:recepie});

    const response = await deleteBookmarkService(recepie, user);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}



export {
    createBookmark,
    deleteBookmark,
}