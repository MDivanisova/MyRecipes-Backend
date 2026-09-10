import e from "express";
import { login, getUserBookmarks, verify, register, resendCode, editUser, deleteUser, getUser, getAllUsers, getUsersRecepies } from "../controller/user.controller.js";
import { authMidler } from "../midler/user.midler.js"
const userRouter = e.Router();



userRouter.put('/', authMidler, editUser);
userRouter.delete('/', authMidler, deleteUser);
userRouter.get('/', authMidler, getUser);
userRouter.get('/users', authMidler, getAllUsers);
userRouter.post('/login', login);
userRouter.post('/register', register);
userRouter.get('/bookmarks', authMidler, getUserBookmarks);
userRouter.get('/recepies', authMidler, getUsersRecepies)
userRouter.post('/verify', verify);
userRouter.post('/resendCode',resendCode);



export default userRouter;