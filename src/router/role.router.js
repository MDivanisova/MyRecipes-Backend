import e from "express";
import { editUsersRole, getRoles } from "../controller/role.controller.js"

const roleRouter = e.Router();

roleRouter.get("/", getRoles);
roleRouter.put("/", editUsersRole)

export default roleRouter;