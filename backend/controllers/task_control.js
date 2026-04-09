import { Todo } from "../module/todo.js"
export const create_task_title = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400)
                .json({
                    message: "Title required",
                    success: false,
                })
        }
        const task = await Todo.create({ title, user: req.user._id, })

        res.status(201).json({
            message: "task created",
            success: true,
            data: task,
        });

    } catch (e) {
        res.status(500)
            .json({
                message: `server errer ${e}`,
                success: false
            })
    }
}

export const show_task_title = async (req, res) => {
    try {
        const title_task_list = await Todo.find({ user: req.user._id })
        // console.log(title_list)
        res.status(200)
            .json({
                success: true,
                data: title_task_list,
            })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

export const update_task_content = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                message: "content required",
                success: false,
            });
        }

        const todo = await Todo.findOneAndUpdate(
            { _id: id, user: req.user._id }, // ✅ filter
            { text: text },            // ✅ update

        );



        if (!todo) {
            return res.status(404).json({
                message: "Note not found",
                success: false
            });
        }
        todo.task.push({
            text,
            completed_todo: false,
            createdAt: new Date()
        });

        await todo.save();

        res.status(200).json({
            message: "Note content updated",
            success: true,
            data: todo,
        });

    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false
        });
    }
};