import {defaultTitle} from "../services/default_title.js";
import {Note} from '../module/notes.js';
import {Todo} from '../module/todo.js';
function rename(Model){return async(req,res)=>{try{const title=req.body.title;if(typeof title!=='string'||title.trim().length>200)return res.status(400).json({success:false,message:'Enter a title up to 200 characters.'});const item=await Model.findOneAndUpdate({_id:req.params.id,user:req.user._id},{$set:{title:title.trim()||defaultTitle()}},{returnDocument:'after',runValidators:true});if(!item)return res.status(404).json({success:false,message:'Item not found'});return res.json({success:true,message:'Title updated',data:item});}catch{return res.status(500).json({success:false,message:'Could not update the title. Please retry.'})}}}
export const renameNote=rename(Note);
export const renameTask=rename(Todo);
