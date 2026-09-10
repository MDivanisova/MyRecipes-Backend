import { editUsersRoleService, getRolesService } from "../service/roles.service.js"
import {roleEditSchema} from '../utils/role.validation.js'

const getRoles = async(req, res)=>{
    const result = await getRolesService();

    return res.status(result.statusCode).json({
        "msg": result.msg,
        "roles": result.roles
    })
}

const editUsersRole = async(req, res)=>{
    const userId = req.body.userId;
    const role = req.body.role;
    
    const val = await roleEditSchema.parse({_id: userId, role: role});

    const response = await editUsersRoleService(userId, role);

    return res.status(response.statusCode).json({
        "msg": response.msg
    })
}

export {
    getRoles,
    editUsersRole
}