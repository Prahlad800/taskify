import { Router } from "express";
import { auth_sigup,auth_login } from "../middleware/auth_user.js";
import { signup,login } from "../controllers/user_control.js";

 const router =Router()

router.post("/signup",auth_sigup,signup)
router.post("/login",auth_login,login)

export default router