import { Router } from "express";
import { auth_notes_page } from "../middleware/auth_notes.js";
import { create_task_title,show_task_title,update_task_content } from "../controllers/task_control.js";

const router =Router()

 router.post("/",auth_notes_page,create_task_title)
 router.put("/:id",auth_notes_page,update_task_content)
 router.get("/",auth_notes_page,show_task_title)
//   router.get("/",auth_notes_page,show_title)
 
 
 
 export default router