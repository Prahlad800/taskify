import React from "react";
import { useState, useEffect } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { handleError } from "../util/error";

function Home() {
  const baseURL =
    window.location.hostname === "localhost"
      ? "http://localhost:3030"
      : "https://taskify-gcxc.onrender.com";

  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  const handleNoteClick = async (id) => {
    setSelectedNoteId(id);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${baseURL}/home/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNoteContent(res.data.data.content);
    } catch (error) {
      handleError("Error fetching note", error);
    }
  };
  useEffect(() => {
    if (!selectedNoteId) return;

    const delay = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${baseURL}/home/${selectedNoteId}`,
          { content: noteContent },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        handleError("Update failed", error);
      }
    }, 800); // debounce

    return () => clearTimeout(delay);
  }, [noteContent]);
  const handleAddNoteClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // setNewTitle("");
  };
  const handleSaveTitle = async () => {
    if (!newTitle.trim()) {
      return handleError("Title required");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${baseURL}/home`,
        { title: newTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // UI update instantly (no reload like rookie dev 😏)
      setTitle((prev) => [...prev, res.data.data]);

      handleClosePopup();
    } catch (error) {
      handleError("Error adding title", error);
    }
  };

  const [title, setTitle] = useState([]);
  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
  }, []);

  useEffect(() => {
    const title_show = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${baseURL}/home`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTitle(res.data.data);

        console.log(res.data.data);
      } catch (error) {
        handleError("title show error", error);
      }
    };
    title_show();
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
              <button className="silider-button-notes">notes</button>
              <button className="slider-button-signup">tesk</button>
            </div>
            <div className="slider-add-notes">
              <button onClick={handleAddNoteClick}>Add notes</button>
            </div>
            {showPopup && (
              <div className="popup-overlay">
                <div className="popup-box">
                  <h3>Add New Note</h3>

                  <input
                    type="text"
                    placeholder="Enter new title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />

                  <div className="popup-buttons">
                    <button onClick={handleClosePopup}>Cancel</button>
                    <button onClick={handleSaveTitle}>Save</button>
                  </div>
                </div>
              </div>
            )}
            <div className="slider-notes-list">
              <p className="slider-note-main-notes">Notes</p>
              <div className="all-notes-contener">
                {title.length == 0 ? (
                  <p className="slider-note-not ">No titles found</p>
                ) : (
                  <ul className="slider-note-ul">
                    {title.map((item) => (
                      <li
                        key={item._id}
                        className="slider-note-ls"
                        onClick={() => handleNoteClick(item._id)}
                      >
                        <span className="slider-note-spam">{item.title} </span>
                        <span className="slider-note-spem1">⋮</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="contener-note-content">
            <div className="contener-note-content">
              {selectedNoteId ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="note-textarea"
                />
              ) : (
                <p className="no-note">Select a note</p>
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
