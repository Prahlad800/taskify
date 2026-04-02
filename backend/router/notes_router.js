import { Router } from "express";
import { auth_notes_page } from "../middleware/auth_notes.js";
import { create_title,update_content ,delete_note } from "../controllers/notes_control.js";


 const router =Router()

 router.post("/",auth_notes_page,create_title)
 router.post("/:id",auth_notes_page,update_content)
 router.delete("/:id",auth_notes_page,delete_note)



export default router