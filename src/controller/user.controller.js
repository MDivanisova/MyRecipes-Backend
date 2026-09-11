import { loginService, getUserBookmarksService, verifyService, resendCodeService, registerService, editUserService, deleteUserService, getUserService, getAllUsersService, getUsersRecepiesService } from "../service/user.service.js"
import { registerSchema, loginScehama, resendCodeSchema, verifySchema, editUserSchema } from "../utils/user.validation.js"
import { idSchema } from "../utils/validation.js";

const login = async(req, res)=>{

    const email = req.body.email;
    const password = req.body.password;

    const val =  await loginScehama.parse({email:email, password:password});

    const result = await loginService(email,password);

    return res.status(result.statusCode).json({
        "msg": result.msg,
        "token": result.token,
        "user": result.user
    })

}

const getUserBookmarks = async(req, res)=>{

    const pageNumber = parseInt(req.query.pageNumber);
    const pageSize = parseInt(req.query.pageSize);
    const user = req.user._id;

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
        };
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

     if(req.query.ingredients !== ""){
        filter = {
            ...filter,
            ingredients: {
                $regex: `^${req.query.ingredients}`,
                $options: "i"
            }
        };
    }

    const response = await getUserBookmarksService(user, pageNumber, pageSize, filter);

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })
}

const getUsersRecepies = async(req, res)=>{

    const pageNumber = parseInt(req.query.pageNumber);
    const pageSize = parseInt(req.query.pageSize);

    let user = req.query.userId;
    let flag = true;
    if(user === undefined){
       user = req.user._id;
       flag = false; 
    }


    let filter = {};

    if (req.query.name !== "") {
        filter = {
            ...filter,
            name: { $regex: `^${req.query.name}`, $options: "i"}
        };
    }

    if (flag && req.query.visibility === "all") {
        filter = {
                ...filter,
                visibility: "public"
            };
    } else if (!flag && req.query.visibility !== "all") {
            filter = {
                ...filter,
                visibility: req.query.visibility
            };
    }

    const response = await getUsersRecepiesService( user, pageNumber, pageSize, filter);

    return res.status(response.statusCode).json({
        msg: response.msg,
        result: response.result
    });

}


const register = async(req, res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const gender = req.body.gender;

    registerSchema.parse({name: name, email: email, password: password, gender: gender})
    
    const result = await registerService(name, email, password, gender);

    return res.status(result.statusCode).json({
        "msg": result.msg
    })
}

const verify = async(req, res)=>{
    const code  = req.body.code;
    const email = req.body.email;

    const val = await verifySchema.parse({code, email});

    const result = await verifyService(code, email);

    return res.status(result.statusCode).json({
        msg: result.msg
    })

}

const resendCode = async(req, res)=>{
    const email = req.body.email;

    const val = await resendCodeSchema.parse({email})

    const result = await resendCodeService(email);
    
    
    return res.status(result.statusCode).json({
        msg: result.msg
    })
}

const editUser = async(req, res)=>{
    const userId = req.user._id;
    const name = req.body.name;
    const email = req.body.email;
    const gender = req.body.gender;
    const age = req.body.age;
    const description = req.body.description;
    
    const val = await editUserSchema.parse({_id: userId, 
                                            name: name, 
                                            email: email, 
                                            gender: gender, 
                                            age: age, 
                                            description: description})

    const response = await editUserService(userId, name, email, gender, age, description);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

// serviso ne e gotov skroz
const deleteUser = async(req, res)=>{
    const userId = req.body.userId;

    const result = idSchema.parse({_id: userId});
    const response = await deleteUserService(userId);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

const getUser = async(req, res)=>{
    const userId = req.query.userId || req.user._id;

    const resp = idSchema.parse({_id:userId})
    const response = await getUserService(userId);

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })
}

const getAllUsers = async(req, res)=>{
    
    const pageNumber = parseInt(req.query.pageNumber); 
    const pageSize = parseInt(req.query.pageSize);
    
    let filter = {}
    

    if(req.query.name !== ""){
        filter = {
            ...filter,
            name: { $regex: `^${req.query.name}`, $options: "i" }
        }
    }

    if(req.query.email !== ""){
        filter = {
            ...filter,
            email: { $regex: `^${req.query.email}`, $options: "i" }
        }
    }

    if(req.query.role !== "all"){
        filter = {
            ...filter,
            role: req.query.role
        }
    }
    const response = await getAllUsersService(pageNumber, pageSize, filter);

    return res.status(response.statusCode).json({
        "msg": response.msg,
        "result": response.result
    })
}

export {
    login,
    getUserBookmarks,
    getUsersRecepies,
    register,
    verify,
    resendCode,
    editUser,
    deleteUser,
    getUser,
    getAllUsers
}