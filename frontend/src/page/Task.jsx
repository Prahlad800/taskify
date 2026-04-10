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
  const [priority, setPriority] = useState("");
  const [taskDetails, setTaskDetails] = useState(null);
  

  const [activeTab, setActiveTab] = useState("tasks");
  const [task, setTask] = useState([]);
  const getToken = () => localStorage.getItem("token");

  // create classname in title list

  const baseURL =
    window.location.hostname === "localhost"
      ? "http://localhost:3030"
      : "https://taskify-gcxc.onrender.com";
  // FETCH NOTES
  const fetchNotes = async () => {
    setTaskLoading(true);
    try {
      // setNotesLoading(true)
      const res = await axios.get(`${baseURL}/task`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setTask(res.data.data);

      console.log(res.data.data);
    } catch (error) {
      handleError("Failed to fetch notes", error);
    } finally {
      setTaskLoading(false); // 🔥 ye ALWAYS chalega
    }
    //   console.log("loading:", notesLoading);
    // console.log("notes:", notes);
  };

  // add title
  const handleSaveTask = async () => {
    if (!newTitleTask.trim()) return handleError("Title required");

    try {
      const res = await axios.post(
        `${baseURL}/task`,
        {
          title: newTitleTask,
          priority: priority,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      setTask((prev) => [...prev, res.data.data]);
      setShowPopupTask(false);
      setNewTitleTask("");

      setPriority("medium"); // reset

      handleSuccess("Task added");
    } catch (error) {
      handleError("Error adding task", error);
    }
  };
  const handleTaskClick = async (id)=>{
    
  }

  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
    fetchNotes();
    console.log(taskDetails)
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
                      // defaultValue="medium"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="medium">medium</option>
                      <option value="low">low </option>
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
              <div class="line1"></div>
              <div className="slider-add-notes_btm1">
                <p>Open Task </p>
              </div>
              <div className="slider-add-notes_btm1">
                <p>compleate Todo</p>
              </div>
              <div className="slider-add-notes_btm1">
                <p>Importance Todo</p>
              </div>
            </div>

            <div className={`slider-notes-list  `}>
              <p className="slider-note-main-notes">All Task</p>
              <div class="line"></div>

              <div className="scrolbar_web">
                {taskLoading ? (
                  <div>
                    <p className="loader">Loading notes...</p>
                    <div className="spinner"></div>
                  </div>
                ) : task.length === 0 ? (
                  <p className="slider-note-not">No notes found</p>
                ) : (
                  <ul className="slider-note-ul">
                    {task.map((todo) => (
                      <li
                        key={todo._id}
                        className={`slider-note-ls ${(() => {
                          if (todo.priority == "low") return "priority-low";
                          if (todo.priority == "medium") return "priority-medium";
                          if (todo.priority == "high") return "priority-high";
                           return "";
                        })()}`}

                        onClick={() => {
                           handleTaskClick(note._id);
                          setTaskDetails(todo);
                        }}
                      >
                        
                        <span>{todo.title}</span>
                        <span>{todo.priority}</span>
                        <span>⋮</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="contener-note-content">
            <div>hello</div>
            <div class="line"></div>
            <div></div>
          </div>
        </div>
      </div>

      <Bottome_home />
      <ToastContainer />
    </div>
  );
}

export default Task;
