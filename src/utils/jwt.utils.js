import jwt from "jsonwebtoken";
import { env } from "../config/config.env.js";

const jwtCreate = async(user)=>{
    const token = jwt.sign(user, env.SECRETJWTKEY, {expiresIn: "5h"});

    return token;
}

const jwtVerify = async(token)=>{
    try{
        const tokenUser = jwt.verify(token, env.SECRETJWTKEY);

        return tokenUser;
    }catch(err){
        return undefined;
    }
}

export {
    jwtCreate,
    jwtVerify
}