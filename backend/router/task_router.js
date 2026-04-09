import { Router } from "express";
import { auth_notes_page } from "../middleware/auth_notes.js";
import { create_task_title } from "../controllers/task_control.js";

const router =Router()

 router.post("/",auth_notes_page,create_task_title)
//   router.get("/",auth_notes_page,show_title)
 
 
 
 export default router