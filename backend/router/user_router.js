import { Router } from "express";
import { auth_sigup } from "../middleware/auth_user.js";
import { signup } from "../controllers/user_control.js";

 const router =Router()

router.post("/signup",auth_sigup,signup)

export default router