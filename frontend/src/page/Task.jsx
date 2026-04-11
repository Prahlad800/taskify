import React, { useState, useEffect } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { handleError, handleSuccess } from "../util/error";

function Task() {
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [showPopupTask, setShowPopupTask] = useState(false);
  const [newTitleTask, setNewTitleTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showPopupDeleteTask, setShowPopupDeleteTask] = useState(false);

  const [newTodoText, setNewTodoText] = useState("");
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [todosAddTask, setTodosAddTask] = useState([]);

  const [activeTab, setActiveTab] = useState("tasks");
  const [task, setTask] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const baseURL =
    window.location.hostname === "localhost"
      ? "http://localhost:3030"
      : "https://taskify-gcxc.onrender.com";

  // 🔥 FETCH ALL TASK
  const fetchNotes = async () => {
    setTaskLoading(true);
    try {
      const res = await axios.get(`${baseURL}/task`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTask(res.data.data);
    } catch (error) {
      handleError("Failed to fetch notes", error);
    } finally {
      setTaskLoading(false);
    }
  };

  // 🔥 ADD TASK
  const handleSaveTask = async () => {
    if (!newTitleTask.trim()) return handleError("Title required");

    try {
      const res = await axios.post(
        `${baseURL}/task`,
        { title: newTitleTask, priority },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      setTask((prev) => [...prev, res.data.data]);
      setShowPopupTask(false);
      setNewTitleTask("");
      setPriority("medium");

      handleSuccess("Task added");
    } catch (error) {
      handleError("Error adding task", error);
    }
  };

  // 🔥 FETCH SINGLE TASK
  const handleTaskClick = async (id) => {
    try {
      const res = await axios.get(`${baseURL}/task/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const todo = res.data.data;
      setSelectedTodo(todo);
      setTodosAddTask(todo.task || []);
    } catch (error) {
      handleError("Failed to load task", error);
    }
  };

  // 🔥 ADD TODO TO DB
  const addTodoToDB = async () => {
    try {
      const res = await axios.put(
        `${baseURL}/task/${selectedTodo._id}`,
        {
          text: newTodoText,
          completed_todo: false,
          impotent: false,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      setSelectedTodo(res.data.data);
      setTodosAddTask(res.data.data.task);
      setNewTodoText("");
      // const tempTodo = {
      //   // _id: Date.now(), // temporary id
      //   text: newTodoText,
      //   completed_todo: false,
      //   impotent: false,
      // };

      // setTodosAddTask((prev) => [...prev, tempTodo]);
      // setNewTodoText("");

      handleSuccess("Todo added");
    } catch (err) {
      handleError("Error adding todo", err);
    }
  };
  const formatDate = (noteDetails) => {
    // if (!date) return "N/A"; // safety

    return new Date(noteDetails).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  const handleDeletetask = async (id) => {
    try {
      await axios.delete(`${baseURL}/task/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // 🔥 UI update (task list se remove)
      setTask((prev) => prev.filter((t) => t._id !== id));

      // 🔥 right side reset
      setSelectedTodo(null);

      handleSuccess("Task deleted");
    } catch (err) {
      console.log(err);
      handleError("Delete failed", err);
    }
  };

  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
    fetchNotes();
  }, []);

  return (
    <div>
      <Navbar_home
        loggedInUserName={loggedInUserName}
        loggedInName={loggedInName}
      />

      <div className="hello">
        <div className="contener-note-body">
          <div className="contener-note-slider">
            {/* NAV */}
            <div className="slider-button">
              <Link
                to={"/home"}
                className={`slider-button-signup link ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <span>Notes</span>
              </Link>

              <Link
                to={"/task"}
                className={`slider-button-signup link ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                <span>Tasks</span>
              </Link>
            </div>

            {/* ADD TASK */}
            <div className="slider-add-notes">
              <button
                className="slider-add-notes_btm"
                onClick={() => setShowPopupTask(true)}
              >
                Add Task
              </button>

              {showPopupTask && (
                <div className="popup-overlay">
                  <div className="popup-box">
                    <h3 className="popup_heder">Add New Task</h3>

                    <input
                      type="text"
                      className="popup_box_data"
                      placeholder="Enter title..."
                      value={newTitleTask}
                      onChange={(e) => setNewTitleTask(e.target.value)}
                    />

                    <h3 className="popup_heder">Choose Priority Task</h3>

                    <select
                      className="popup_box_data"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="medium">medium</option>
                      <option value="low">low</option>
                      <option value="high">high</option>
                    </select>

                    <div className="popup-buttons">
                      <button onClick={() => setShowPopupTask(false)}>
                        Cancel
                      </button>
                      <button onClick={handleSaveTask}>Save</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="line1"></div>

              <div className="slider-add-notes_btm1">
                <p>Open Task</p>
              </div>
              <div className="slider-add-notes_btm1">
                <p>compleate Todo</p>
              </div>
              <div className="slider-add-notes_btm1">
                <p>Importance Todo</p>
              </div>
            </div>

            {/* TASK LIST */}
            <div className="slider-notes-list">
              <p className="slider-note-main-notes">All Task</p>
              <div className="line"></div>

              <div className="scrolbar_web">
                {taskLoading ? (
                  <p className="loader">Loading...</p>
                ) : task.length === 0 ? (
                  <p className="slider-note-not">No notes found</p>
                ) : (
                  <ul className="slider-note-ul">
                    {task.map((todo) => (
                      <li
                        key={todo._id}
                        className={`slider-note-ls ${
                          todo.priority === "low"
                            ? "priority-low"
                            : todo.priority === "medium"
                              ? "priority-medium"
                              : "priority-high"
                        }`}
                        onClick={() => handleTaskClick(todo._id)}
                      >
                        <span>{todo.title}</span>
                        <span>⋮</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="contener-note-content">
            <div className="content_task">
              {selectedTodo ? (
                <div className="task-content-wrapper">
                  <div className="show_time_main">
                    <div className="show_time">
                      <h2>Title Name: {selectedTodo.title}</h2>
                      <h2>Priority : {selectedTodo.priority}</h2>

                      <button
                        className="delete_notes"
                        onClick={() => setShowPopupDeleteTask(true)}
                      >
                        Delete
                      </button>
                    </div>
                    {showPopupDeleteTask && (
                      <div className="popup-overlay">
                        <div className="popup-box">
                          <h3 className="delete_note_text">
                            Are you sure you want to delete this task?
                          </h3>

                          <div className="popup-buttons">
                            <button
                              onClick={() => setShowPopupDeleteTask(false)}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await handleDeletetask(selectedTodo._id);
                                setShowPopupDeleteTask(false);
                              }}
                            >
                              Delete Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="show_time">
                      <p>
                        Created At:
                        {formatDate(selectedTodo.createdAt)}
                      </p>

                      <p>
                        Updated At:
                        {formatDate(selectedTodo.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="line"></div>

                  {/* ADD TODO */}
                  <div className="todo-input-wrapper">
                    <input
                      type="text"
                      className="todo-input"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="Write task..."
                    />

                    <button
                      className="add-btn todo-add-btn"
                      onClick={addTodoToDB}
                    >
                      + Add Todo
                    </button>
                  </div>

                  <div className="line"></div>

                  {/* TODO LIST */}
                  <div className="todo-list-wrapper">
                    {todosAddTask.map((item) => (
                      <div
                        key={item._id}
                        className={`todo-item todo-row ${item.impotent ? "important" : ""}`}
                      >
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={item.completed_todo}
                          onChange={async () => {
                            try {
                              const updated = todosAddTask.map((t) =>
                                t._id === item._id
                                  ? { ...t, completed_todo: !t.completed_todo }
                                  : t,
                              );
                              setTodosAddTask(updated);
                              const res = await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { completed_todo: !item.completed_todo },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );

                              setSelectedTodo(res.data.data);
                              setTodosAddTask(res.data.data.task);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                        />

                        {/* TEXT */}
                        <input
                          type="text"
                          className={`todo-text ${item.completed_todo ? "completed" : ""}`}
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...todosAddTask];
                            updated.find((t) => t._id === item._id).text =
                              e.target.value;
                            setTodosAddTask(updated);
                          }}
                          onBlur={async () => {
                            try {
                              await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { text: item.text },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          placeholder="Write task..."
                        />
                        <div className="todo-date">
                          created time {formatDate(item?.createdAt)}
                        </div>

                        {item.completed_todo && item.completedAt && (
                          <div className="todo-date completed-time">
                            completed time {formatDate(item.completedAt)}
                          </div>
                        )}
                        {/* STAR */}
                        <button
                          className="star-btn todo-star-btn"
                          onClick={async () => {
                            try {
                              const res = await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { impotent: !item.impotent },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );

                              setSelectedTodo(res.data.data);
                              setTodosAddTask(res.data.data.task);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                        >
                          {item.impotent ? "⭐" : "☆"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-task-text">Select a task</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Bottome_home />
      <ToastContainer />
    </div>
  );
}

export default Task;
