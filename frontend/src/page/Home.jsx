import React from "react";
import { useState, useEffect } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { handleError,  } from "../util/error";

function Home() {
  const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3030"
    : "https://taskify-gcxc.onrender.com";
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");

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
  },[]);

  return (
    <>
      <Navbar_home
        loggedInUserName={loggedInUserName}
        loggedInName={loggedInName}
      />
      <div className="hello">
        <div className="contener-note-body">
          <div className="contener-note-slider">
            <div>
              <button>notes</button>
              <button>tesk</button>
            </div>
            <div>
              <button>Add notes</button>
            </div>
              <div>
                <p>Notes</p>
                {title.length == 0 ? (
                  
                    <p>No titles found</p>
                  
                ) : (
                  <ul>
                    {title.map((item ) => (
                      <li key={item._id}>
                       <span>{item.title} </span> 
                       <span>⋮</span>
                        </li>
                    ))}
                  </ul>
                )}
              </div>
            
          </div>
          <div className="contener-note-content"></div>
        </div>
        <Bottome_home/>
      </div>
      <ToastContainer />
    </>
  );
}

export default Home;
