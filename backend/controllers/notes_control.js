import { Note } from "../module/notes.js";


export const create_title = async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400)
                .json({
                    message: "Title required",
                    success: false,
                })
        }
        const note = await Note.create({ title, user: req.user._id, })

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

        if (!content) {
            return res.status(400).json({
                message: "content required",
                success: false,
            });
        }

        const note = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id }, // ✅ filter
            { content: content },            // ✅ update
            { returnDocument: 'after' }                   // ✅ options
        );

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

        await Note.findByIdAndDelete(id);

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
        const title_list = await Note.find({  user: req.user._id }, "title")
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