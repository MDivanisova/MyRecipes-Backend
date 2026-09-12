import userModel from "../model/user.model.js";
import { jwtCreate, jwtVerify } from "../utils/jwt.utils.js"
import bookmarkModel from "../model/bookmark.model.js";
import { gender } from "../utils/enum.js";
import { getDefaultRole } from "./roles.service.js";
import transporter from '../utils/transporter.js';
import verificationCodeModel from "../model/verification.mode.js";
import { success } from "zod";
import recepieModel from "../model/recepie.model.js";
import { deleteRecepieService } from "./recepie.service.js";
import { deleteRatingsService } from "./rating.service.js";
import reviewModel from "../model/review.model.js";
import ratingModel from "../model/rating.model.js";
import { deleteReviewsService } from "./review.service.js";
import { deleteBookmarksService } from "./bookmark.service.js";

const loginService = async(email, password)=>{
    const existingUser = await userModel.findOne({email:email})
                                        .populate('role','roleName');
    if(!existingUser){
        return {
            "msg": "Invalid credentials",
            "statusCode": 401
         }
    }
    const pwCmp = await existingUser.compare(password);
    
    if(!pwCmp){
         return {
            "msg": "Invalid credentials",
            "statusCode": 401
         }
    }

    if(!existingUser.isVerified){
        return {
            "msg": "Email not verifed.",
            "email": existingUser.email,
            "statusCode": 401
        }
    }
    const jwtUser ={
        email: existingUser.email,
        _id: existingUser._id,
    }

    existingUser.lastLogedIn = new Date();
    await existingUser.save()

    const jwToken = await jwtCreate(jwtUser);

    return {
        "msg": "Succesfuly login",
        "token": jwToken,
        "statusCode": 200,
        "user": {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            gender: existingUser.gender,
            role: existingUser.role
        }
    }

    
}

const getUserBookmarksService = async(user, pageNumber, pageSize, filter)=>{

    const bookmarks = await bookmarkModel.find({user: user})
                                                        .populate({
                                                            path: "recepie",
                                                            populate: {
                                                                path: "creator"
                                                            }
                                                        })
                                                        .sort({ createdAt: -1 });

    const filteredBookmarks = bookmarks.filter(bookmark => {

            const recepie = bookmark.recepie;

            if (
                filter.name &&
                !recepie.name.match(filter.name.$regex, filter.name.$options)
            ) {
                return false;
            }

            if (
                filter.creator &&
                recepie.creator._id.toString() !== filter.creator.toString()
            ) {
                return false;
            }

            if (
                filter.category &&
                !recepie.category.includes(filter.category)
            ) {
                return false;
            }

            if (
                filter.cuisine &&
                !recepie.cuisine.includes(filter.cuisine)
            ) {
                return false;
            }

            if (
                filter.ingredients &&
                !recepie.ingredients.some(ingredient =>
                    ingredient.ingredient.match(
                        filter.ingredients.$regex,
                        filter.ingredients.$options
                    )
                )
            ) {
                return false;
            }

            return true;
        });


    
    const skip = (pageNumber - 1)*pageSize;

    const recepies = filteredBookmarks.slice(
        skip,
        skip + pageSize
    );
    
    const numRecepies = filteredBookmarks.length;

    const totalPages = Math.ceil(numRecepies / pageSize);
    
    return {
        "msg": "bookmarked recepies were successfully fetched",
        "result": {
                recepies: recepies,
                pagination: {
                    numRecepies: numRecepies,
                    totalPages: totalPages,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
        },
        "statusCode": 200
    }

}

const getUsersRecepiesService = async(user, pageNumber, pageSize, filter)=>{

    const skip = (pageNumber - 1) * pageSize;

    const query = {
        creator: user,
        ...filter
    };

    const recepies = await recepieModel.find(query)
                                        .populate("creator")
                                        .skip(skip)
                                        .limit(pageSize)
                                        .sort({ createdAt: -1 });

    const numRecepies = await recepieModel.countDocuments(query);

    const totalPages = Math.ceil(numRecepies / pageSize);

    return {
        msg: "user recepies were successfully fetched",
        result: {
            recepies: recepies,
            pagination: {
                numRecepies: numRecepies,
                totalPages: totalPages,
                pageNumber: pageNumber,
                pageSize: pageSize
            }
        },

        statusCode: 200
    };

}

const registerService = async(name, email, password, gender)=>{
   const role = await getDefaultRole();

   const existing = await userModel.findOne({ email: email });
   if(existing){
    return {
        "msg": "Email in use.",
        "statusCode": 409
    }
   }
  
    const newUser = new userModel({
        name: name,
        email: email,
        password: password,
        gender: gender,
        description: "",
        role: role._id,
        isVerified: false
    }); 

    await newUser.save();


    const code = String(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
    const subject = "Registration validation code";

    const verificationCode = new verificationCodeModel({
        email: email,
        code: code
    });

    await verificationCode.save();

    const text = "Here is the registration code past it in " + code;
        const info = await transporter.sendMail({
        from: '"Recepie App" <no-reply@myapp.com>',
        to: email,
        subject,
        text,
        });
    
    return{
        "msg": "Registration Successful check your mail for the verification code.",
        "statusCode": 200
    }
}

const verifyService = async(code, email)=>{
    
    const codeNumber = await verificationCodeModel.findOne({code: code, email: email});
    const user = await userModel.findOne({email: email});

    if(!user){
        return {
            "msg":"Perons dose not exist",
            "statusCode": 404
        }
    }

    if(!codeNumber){
        return {
            "msg": "not success",
            "statusCode": 404
        }
    }

    user.isVerified = true;

    await user.save();
    
    return {
        "msg": "success",
        "statusCode": 200
    }
}

const resendCodeService = async(email)=>{
    const codeNumber = String(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
    const subject = "Email validation code";

    const user = await userModel.findOne({email: email});

    if(!user){
        return{
            "msg": "Person does not exist",
            "statusCode": 404
        }
    }


    const verificationCode = new verificationCodeModel({
        email: email,
        code: codeNumber
    });

    await verificationCode.save();

    const text = "Here is the email verification code past it in " + codeNumber;
    
    const info = await transporter.sendMail({
      from: '"Recepie App" <no-reply@myapp.com>',
      to:email,
      subject,
      text,
    });

    

    return{
        "msg": "Check your mail for the verification code.",
        "statusCode": 200
    }
}

const editUserService = async(userId, name, email, gender, age, description)=>{
    const existingUser = await userModel.findOne({_id: userId})
    if(!existingUser){
        return{
            "msg": "User doesn't exist",
            "statusCode": 404
        }
    }
    let mailChange = false;
    console.log(`Existing user email: ${existingUser.email} New email: ${email}`);
    if(existingUser.email != email){
        const existingEmail = await userModel.findOne({email: email})
        if(existingEmail){
            return{
                "msg": "Email in use",
                "statusCode": 409
            }
       }
        existingUser.email = email;
        existingUser.isVerified = false;
        console.log(`Email changed. Sending verification code to ${email}`);
        await resendCodeService(email);
        console.log(`Verification code sent to ${email}`);
       mailChange = true;

    }

    existingUser.name = name;
    existingUser.gender = gender;
    existingUser.age = age;
    existingUser.description = description;

    await existingUser.save();

    return {
        "msg": "User succesfully modifyed ",
        "statusCode": mailChange ? 200: 201
    }
}

//treba da se dodade deka treba da se brisat site recepti komentari bookmarks ratings reviews ne e dovrseno  
const deleteUserService = async (userId) => {

    const existingUser = await userModel.findOne({
        _id: userId
    });

    if (!existingUser) {
        return {
            msg: "User doesn't exist",
            statusCode: 404
        };
    }

    // Delete recipes created by the user
    const recepie = await recepieModel.find({
        creator: userId
    });

    for (const r of recepie) {
        await deleteRecepieService(r);
    }

    // Delete user's bookmarks
    const bookmarks = await bookmarkModel.find({
        user: userId
    });

    if (bookmarks.length > 0) {
        await deleteBookmarksService(bookmarks);
    }

    // Delete user's ratings
    const ratings = await ratingModel.find({
        rater: userId
    });

    if (ratings.length > 0) {
        await deleteRatingsService(ratings);
    }

    // Delete user's reviews
    const reviews = await reviewModel.find({
        reviewer: userId
    });

    if (reviews.length > 0) {
        await deleteReviewsService(reviews);
    }

    // Finally delete the user
    await existingUser.deleteOne();

    return {
        msg: "User successfuly deleted",
        statusCode: 200
    };
};

const getUserService = async(userId)=>{
    const existingUser = await userModel.findOne({_id: userId})
                                        .populate("recepies")
                                        .populate("role");
    if(!existingUser){
        return{
            "msg": "User doesnt exist",
            "statusCode": 404
        }
    }

    return {
        "msg": "user successfuly fetch",
        "statusCode": 200,
        "result": existingUser
    }


}

const getAllUsersService = async(pageNumber, pageSize, filter)=>{

    const skip = (pageNumber - 1)*pageSize;

    const users = await userModel.find(filter)
                                        .populate("role")
                                        .skip(skip)
                                        .limit(pageSize)
                                        .sort({createdAt: -1});

    const numUsers = await userModel.countDocuments(filter);
    const totalPages = Math.ceil(numUsers / pageSize);
    
    return {
        "msg": "users were succesfully fetched",
        "result": {
                users: users,
                pagination: {
                    numUsers: numUsers,
                    totalPages: totalPages,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
        },
        "statusCode": 200
    }
}

export {
    loginService,
    getUserBookmarksService,
    getUsersRecepiesService,
    registerService,
    verifyService,
    resendCodeService,
    editUserService,
    deleteUserService,
    getUserService,
    getAllUsersService
}