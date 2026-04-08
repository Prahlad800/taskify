import React from "react";
import "./navbar_home.css";

function Navbar_home(props) {
  const date = new Date();
  const h = date.getHours();
  let greatign = "";
  if (h < 12) greatign = "Good mornging";
  else if (h < 19) greatign = "Good Afternoon";
  else greatign = "Good Night";
  // console.log(h)
  
const baseURL11 = () => {
  return window.location.hostname === "localhost"
    ? "http://localhost:5173"
    : "https://taskify-notes-task.vercel.app";
};

  return (
    <div className="hello">
      <div className="contener-main">
        
          <div className="contener-img" onClick={() => (window.location.href = baseURL11())}>
            
            <img src="/taskify-logo.png" alt="taskify logo" className="logo" />
            <img src="/taskify-text1.png" alt="taskify text" className="text" />
            
          </div>

        <div className="contener-user">
          <h1 className="greating">{greatign}</h1>
          <h1 className="user">{props.loggedInName || " Welcome"}</h1>
        </div>
        <div className="contener-name">
          <h2 className="name">{props.loggedInUserName || "Guest"}</h2>
          <div className="profile"></div>
        </div>
      </div>
    </div>
  );
}

export default Navbar_home;
