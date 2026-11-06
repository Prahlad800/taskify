import {organizeNote} from "../controllers/note_organizer.js";
import {renameNote} from "../controllers/title_control.js";
import { Router } from "express";
import { auth_notes_page } from "../middleware/auth_notes.js";
import { create_title,update_content ,delete_note ,show_title,show_content } from "../controllers/notes_control.js";


 const router =Router()
router.patch("/:id/title",auth_notes_page,renameNote);
router.patch("/:id/settings",auth_notes_page,organizeNote);

 router.post("/",auth_notes_page,create_title)
 router.put("/:id",auth_notes_page,update_content)
 router.get("/:id",auth_notes_page,show_content)
 router.delete("/:id",auth_notes_page,delete_note)

 router.get("/",auth_notes_page,show_title)



export default router