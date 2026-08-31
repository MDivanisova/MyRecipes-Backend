import roleModel from "../model/role.model.js";
import userModel from "../model/user.model.js";
import { role } from "../utils/enum.js";

const getRolesService = async()=>{
    const roles = await roleModel.find({});
    
    if(roles.length === 0){
        return {
           "msg": "roles could'nt be find",
           "statusCode": 404,
           "roles": []
        }
    }

    return{
        "msg": "the roles are fetch",
        "statusCode": 200,
        "roles": roles
    }
}

const getDefaultRole = async ()=> {
    const defualtRole = await roleModel.findOne({roleName: role.REGULARUSER.roleName});
    return defualtRole;
}

//samo za administratoro treba da e vaj endpoint
const editUsersRoleService = async(userId, roleId)=>{
    const existingUser = await userModel.findOne({_id: userId})
    if(!existingUser){
        return{
            "msg": "user doesn't exist",
            "statusCode": 404
        }
    }
    const existingRole = await roleModel.findOne({_id: roleId})
    if(!existingRole){
        return{
            "msg": "role doesnt exist",
            "statusCode": 404
        }
    }

    existingUser.role = roleId;
    await existingUser.save();

    return{
        "msg": "user's role has been changed",
        "statusCode": 200
    }
}

export {
    getRolesService,
    getDefaultRole,
    editUsersRoleService
}