import { Todo } from "../module/todo.js"
export const create_task_title = async (req, res) => {
    try {
        const { title, priority } = req.body;

        if (!title) {
            return res.status(400)
                .json({
                    message: "Title required",
                    success: false,
                })
        }
        const task = await Todo.create({ title, priority, user: req.user._id, })

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
        const { text, completed_todo, impotent } = req.body;

        if (!text) {
            return res.status(400).json({
                message: "content required",
                success: false,
            });
        }

        const todo = await Todo.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                $push: {
                    task: {
                        text: text,
                        completed_todo: completed_todo,
                        impotent: impotent,
                        createdAt: new Date(),
                    },
                },
            },{ new: true })


        if (!todo) {
            return res.status(404).json({
                message: "Task not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Todo added successfully",
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

export const delete_task = async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findByIdAndDelete({
            _id: id,
            user: req.user._id
        });
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized",
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });

    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false,
        });
    }
};



export const show_task = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required",
            });
        }


        const show_task_input = await Todo.findOne({
            _id: id,
            user: req.user._id
        })
        // console.log(title_list)
        if (!show_task_input) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        res.status(200)
            .json({
                success: true,
                data: show_task_input,
            })




    } catch (e) {
        res.status(500).json({
            message: `server error ${e}`,
            success: false
        });
    }

}
export const update_task_item = async (req, res) => {
  try {
    const { id, todoId } = req.params;
    const { text, completed_todo, impotent } = req.body;

    const todo = await Todo.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
        success: false,
      });
    }

    const item = todo.task.id(todoId); // 🔥 PEHLE item lo

    if (!item) {
      return res.status(404).json({
        message: "Todo item not found",
        success: false,
      });
    }

    // 🔥 AB update karo
    if (text !== undefined) item.text = text;

    if (completed_todo !== undefined) {
      item.completed_todo = completed_todo;
      item.completedAt = completed_todo ? new Date() : null;
    }

    if (impotent !== undefined) item.impotent = impotent;

    await todo.save();

    res.status(200).json({
      message: "Todo updated",
      success: true,
      data: todo,
    });

  } catch (e) {
    res.status(500).json({
      message: `server error ${e}`,
      success: false,
    });
  }
};