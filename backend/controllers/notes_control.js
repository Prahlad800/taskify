import {defaultTitle} from "../services/default_title.js";
import { Note } from "../module/notes.js";


export const create_title = async (req, res) => {
    try {
        const {title,collection='notes'}=req.body;
        if(title!==undefined&&typeof title!=='string')return res.status(400).json({success:false,message:'Title must be text'});
        if((title||'').trim().length>200)return res.status(400).json({success:false,message:'Title must be at most 200 characters'});
        if(!['notes','favorites','reminders','archive'].includes(collection))return res.status(400).json({success:false,message:'Invalid note collection'});
        const note=await Note.create({title:(title||'').trim()||defaultTitle(),user:req.user._id,pinned:collection==='favorites',archivedAt:collection==='archive'?new Date():null,reminderAt:collection==='reminders'?new Date():null});

        res.status(201).json({
            message: "Note created",
            success: true,
            data: note,
        });

    } catch (e) {
        res.status(500)
            .json({
                message: `server errer ${e}`,
                success: false
            })
    }
}


export const update_content = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (typeof content !== "string") {
            return res.status(400).json({
                message: "content must be a string",
                success: false,
            });
        }

        const note = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id }, // ✅ filter
            { content: content },            // ✅ update
            { returnDocument: 'after' }                   // ✅ options
        );

        // const note = await Note.findOne({
        //     _id: id,
        //     user: req.user._id
        // });

        if (!note) {
            return res.status(404).json({
                message: "Note not found",
                success: false
            });
        }


        res.status(200).json({
            message: "Note content updated",
            success: true,
            data: note,
        });

    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false
        });
    }
};

export const delete_note = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Note.findOneAndDelete({
             _id: id,
            user: req.user._id 
        });
        if(!deleted)return res.status(404).json({success:false,message:"Note not found"});

        res.json({
            success: true,
            message: "Note deleted",
        });

    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false,
        });
    }
};

export const show_title = async (req, res) => {
    try {
        const title_list = await Note.find({ user: req.user._id }).sort({updatedAt:-1,_id:-1})
        // console.log(title_list)
        res.status(200)
            .json({
                success: true,
                data: title_list,
            })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

export const show_content = async (req, res) => {
    try {
        const { id } = req.params;


        const show_content_text = await Note.findOne({
            _id: id,
            user: req.user._id
        });
        if (!show_content_text) return res.status(404).json({success:false,message:"Note not found"});
        // console.log(title_list)
        res.status(200)
            .json({
                success: true,
                data: show_content_text,
            })




    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false
        });
    }

}