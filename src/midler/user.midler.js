import { jwtVerify } from "../utils/jwt.utils.js";


const authMidler = async (req, res, next)=>{

    if(req.headers['authorization'] == undefined){
        return res.status(401).json({
            "msg": "Unauthorized"
        })
    }
    const potentialToken = req.headers['authorization'].split(" ");
    
    let token = potentialToken[0];
    
    if(potentialToken.length === 2){
        token = potentialToken[1]
    }
    
    const user = await jwtVerify(token);

    if(!user){
        return res.status(401).json({
            "msg": "Unauthorized"
        })
    }
    
    req.user = user;
    next();
}

export {
    authMidler
}