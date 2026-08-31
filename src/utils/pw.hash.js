import bcrypt, { hash } from "bcrypt"
import { env } from "../config/config.env.js"


const pwHash = async(originalPassword)=>{
    const passwordHashed = await bcrypt.hash(originalPassword, Number.parseInt(env.HASH_ROUND));
    
    return passwordHashed;
}

const pwCmp = async(originalPassword, hashedPassword)=>{
    const passwordCompared = await bcrypt.compare(originalPassword, hashedPassword);

    return passwordCompared;
}

export {
    pwHash,
    pwCmp
}