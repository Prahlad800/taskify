import React, { useEffect, useState } from "react";
import axios from "axios";
import "./footer_home.css";

const Bottome_home = () => {
  const [time, setTime] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [pushedAt, setPushedAt] = useState(null);

  // ⏱️ Live Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🌐 GitHub API Call
  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await axios.get(
          "https://api.github.com/repos/Prahlad800/taskify",
        );

        setCreatedAt(new Date(res.data.created_at));
        setUpdatedAt(new Date(res.data.updated_at));
        setPushedAt(new Date(res.data.pushed_at));
      } catch (error) {
        console.error("GitHub fetch error:", error);
      }
    };

    fetchRepo();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Loading...";
    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left */}
        <div className="footer-left">
          <h2>Taskify</h2>
          <p>© {new Date().getFullYear()} Taskify</p>
          <p>All rights reserved</p>
        </div>

        {/* Center */}
        <div className="footer-center">
          <h3>{time}</h3>
          <p className="ampm">Live Time </p>

          <div className="time-wrapper">
          <p className="time-info">Created: {formatDate(createdAt)}</p>
          <p className="time-info">Updated: {formatDate(updatedAt)}</p>
          <p className="time-info">Pushed: {formatDate(pushedAt)}</p>
        </div>
        </div>
        

        {/* Right */}
        <div className="footer-right">
          <p>Developed by</p>
          <h3>Prahlad</h3>
        </div>
      </div>
    </footer>
  );
};

export default Bottome_home;
