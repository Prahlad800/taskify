import { Router } from "express";
import { auth_notes_page } from "../middleware/auth_notes.js";
import { create_title,update_content ,delete_note ,show_title } from "../controllers/notes_control.js";


 const router =Router()

 router.post("/",auth_notes_page,create_title)
 router.put("/:id",auth_notes_page,update_content)
 router.delete("/:id",auth_notes_page,delete_note)

 router.get("/",auth_notes_page,show_title)



export default router