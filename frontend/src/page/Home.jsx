import React, { useState, useEffect } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../util/error";

function Home() {
  const baseURL =
    window.location.hostname === "localhost"
      ? "http://localhost:3030"
      : "https://taskify-gcxc.onrender.com";
  const navigate = useNavigate();

  // USER INFO
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");

  // NOTES STATE
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteDetails, setNoteDetails] = useState(null);
  //  const [data, setData] = useState(null);

  // UI STATE
  const [notesLoading, setNotesLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupDeleteNotes, setShowPopupDeleteNotes] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeTab, setActiveTab] = useState("notes");

  // TOKEN HELPER
  const getToken = () => localStorage.getItem("token");

  // FETCH NOTES
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      // setNotesLoading(true)
      const res = await axios.get(`${baseURL}/home`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setNotes(res.data.data);

      // console.log(res.data.data)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleError("Token expired or invalid", error);

        // ❌ remove token
        localStorage.removeItem("token");

        // 🔁 redirect using react router
        navigate("/login");
      } else {
        handleError("Failed to fetch notes", error);
      }
      handleError("Failed to fetch notes", error);
    } finally {
      setNotesLoading(false); // 🔥 ye ALWAYS chalega
    }
    //   console.log("loading:", notesLoading);
    // console.log("notes:", notes);
  };

  // ADD NOTE
  const handleSaveTitle = async () => {
    if (!newTitle.trim()) return handleError("Title required");

    try {
      const res = await axios.post(
        `${baseURL}/home`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      setNotes((prev) => [...prev, res.data.data]);
      setShowPopup(false);
      setNewTitle("");
      handleSuccess("Note added");
    } catch (error) {
      handleError("Error adding note", error);
    }
  };

  // SAVE CONTENT
  const handleSaveContent = async () => {
    if (!selectedNote) return;

    try {
      const res = await axios.put(
        `${baseURL}/home/${selectedNote._id}`,
        { content: noteContent },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      if (res.data.success) {
        handleSuccess("Content updated");
        fetchNotes();
      }
    } catch (error) {
      handleError("Failed to save content", error);
    }
  };

  // 🔥 CLICK NOTE (IMPORTANT FIX)
  const handleNoteClick = async (id) => {
    try {
      const res = await axios.get(`${baseURL}/home/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const note = res.data.data;

      setSelectedNote(note);
      setNoteContent(note.content || "");
    } catch (error) {
      handleError("Failed to load note", error);
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
  // delete notes
  const handleDeleteNote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${baseURL}/home/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        handleSuccess("Note deleted");
        if (selectedNote && selectedNote._id === id) {
          setSelectedNote(null);
          setNoteContent("");
        }
        fetchNotes();
      }
    } catch (error) {
      handleError("Failed to delete note", error);
    }
  };

  // LOAD USER + NOTES
  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
    fetchNotes();
  }, []);

  return (
    <>
      <Navbar_home
        loggedInUserName={loggedInUserName}
        loggedInName={loggedInName}
      />

      <div className="hello">
        <div className="contener-note-body">
          <div className="contener-note-slider">
            <div className="slider-button">
              <button
                className={`silider-button-notes ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                Notes
              </button>
              <Link
                to={"/task"}
                className={`slider-button-signup link ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks
              </Link>
            </div>

            <div className="slider-add-notes">
              <button
                onClick={() => setShowPopup(true)}
                className="slider-add-notes_btm"
              >
                Add Notes
              </button>
            </div>

            {/* POPUP */}
            {showPopup && (
              <div className="popup-overlay">
                <div className="popup-box">
                  <h3>Add New Note</h3>
                  <input
                    type="text"
                    className="popup_box_data"
                    placeholder="Enter title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div className="popup-buttons">
                    <button onClick={() => setShowPopup(false)}>Cancel</button>
                    <button onClick={handleSaveTitle}>Save</button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES LIST */}
            <div className="slider-notes-list">
              <p className="slider-note-main-notes">Notes</p>
              <div class="line"></div>
              <div className="scrolbar_web">

              {notesLoading ? (
                <div>
                  <p className="loader">Loading notes...</p>
                  <div className="spinner"></div>
                </div>
              ) : notes.length === 0 ? (
                <p className="slider-note-not">No notes found</p>
              ) : (
                <ul className="slider-note-ul">
                  {notes.map((note) => (
                    <li
                      key={note._id}
                      className="slider-note-ls"
                      
                      onClick={() => {
                        handleNoteClick(note._id);
                        setNoteDetails(note);
                      }}
                    >
                      <span>{note.title}</span>
                      <span>⋮</span>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="contener-note-content">
            <div className="contener-note-content-input">
              {selectedNote ? (
                <div className="editor-container">
                  <div className="show_time_main">
                    <div className="show_time">
                      <h2>Title Name: {noteDetails.title}</h2>

                      <button
                        className="delete_notes"
                        onClick={() => setShowPopupDeleteNotes(true)}
                      >
                        Delete
                      </button>
                    </div>
                    {showPopupDeleteNotes && (
                      <div className="popup-overlay">
                        <div className="popup-box">
                          <h3 className="delete_note_text">
                            Are you sure you want to delete this note?
                          </h3>

                          <div className="popup-buttons">
                            <button
                              onClick={() => setShowPopupDeleteNotes(false)}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteNote(noteDetails._id)}
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
                        {formatDate(noteDetails.createdAt)}
                      </p>

                      <p>
                        Updated At:
                        {formatDate(noteDetails.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="save-btn-div">
                    <button className="save-btn" onClick={handleSaveContent}>
                      Save Content
                    </button>
                  </div>

                  <textarea
                    className="editor-textarea"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note..."
                  />
                </div>
              ) : (
                <div className="empty-editor">
                  <p>Select a note to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Bottome_home />
      </div>

      <ToastContainer />
    </>
  );
}

export default Home;
