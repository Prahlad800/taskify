import {Todo} from "../module/todo.js"
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
            message: "Note created",
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