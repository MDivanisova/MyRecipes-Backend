import bookmarkModel from "../model/bookmark.model.js";
import recepieModle from "../model/recepie.model.js";
import userModel from "../model/user.model.js";

const createBookmarkService = async(user, recepie)=>{
    const existingRecepie = await recepieModle.findOne({_id: recepie});

    if(!existingRecepie){
        return{ 
            "msg": "This recipe dose not exist",
            "statusCode": 404
        }
    }

    const existingUser = await userModel.findOne({_id: user})
    
    if(!existingUser){
        return{ 
            "msg": "user dose not exist",
            "statusCode": 404
        }
    }

    const isBookmark = await bookmarkModel.findOne({user:user, recepie:recepie})
    if(isBookmark){
        return{ 
            "msg": "This recipe is already bookmarked",
            "statusCode": 409
        }
    }
   
    const newBookmark = new bookmarkModel({
        user: user,
        recepie: recepie
    })

    await newBookmark.save();

    existingRecepie.numberBookmarks = existingRecepie.numberBookmarks+1;
    existingRecepie.save();

    existingUser.bookmarks = existingUser.bookmarks+1;
    existingUser.save()

    return {
        "msg": "Recepie is succesfully bookmarked",
        "statusCode": 200
    };

}

const deleteBookmarkService = async(recepie, user)=>{

    const existingUser = await userModel.findOne({_id: user})
    
    if(!existingUser){
        return{ 
            "msg": "user dose not exist",
            "statusCode": 404
        }
    }

    const findingBookmark = await bookmarkModel.findOne({recepie:recepie, user: user})

    if(!findingBookmark){
        return {
            "msg": "Bookmark for this recepie is not found",
            "statusCode": 404
        }
    }

    const existingRecepie = await recepieModle.findOne({_id: recepie});

    if(!existingRecepie){
        return{ 
            "msg": "This recipe dose not exist",
            "statusCode": 404
        }
    }

    await findingBookmark.deleteOne();

    existingRecepie.numberBookmarks--;
    await existingRecepie.save();

    existingUser.bookmarks--;
    existingUser.save()

    return {
        "msg": "Bookmark succesfully deleted",
        "statusCode": 200
    }
    
}

const deleteBookmarksService = async(bookmarks)=>{
    const result = await bookmarkModel.deleteMany({_id:{$in: bookmarks}});

    if(result.deletedCount === bookmarks.length){
        return {
            "success": true,
        }
    }
    return {
        "success": false
    }
}


export {
    createBookmarkService,
    deleteBookmarkService,
    deleteBookmarksService
}