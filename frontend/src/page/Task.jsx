import React, { useState, useEffect } from "react";

import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../util/error";

function Task() {
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");

  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
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
              <button>Add Task</button>
            </div>

            <div className="slider-notes-list">
              <p className="slider-note-main-notes">Task</p>
              <div class="line"></div>
            </div>
          </div>

          <div className="contener-note-content"></div>
        </div>
      </div>

      <Bottome_home />
      <ToastContainer />
    </div>
  );
}

export default Task;
