import React from "react";
import Navbar from "../components/sigup/Navbar";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../components/sigup/body.css";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { handleError, handleSuccess } from "../util/error";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    user_name: "",
    email: "",
    number: "",
    password: "",
  });

  const handlerInput = (e) => {
    // console.log(e.target.value)
    const { name, value } = e.target;
    const copyUserData = { ...userData, [name]: value };
    setUserData(copyUserData);
    // console.log(copyUserData)
  };
  const handlerSubmit = async (e) => {
    e.preventDefault();
    const { name, email, user_name, password, number } = userData;
    if (!name || !email || !password || !user_name || !number) {
      return handleError("All fields required");
    }
    try {
      const res = await axios.post(
        "https://taskify-gcxc.onrender.com/user/signup",
        userData,
      );
      const { jwtToken, users } = res.data;
        
      if (res.data.success) {
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUserName", users.user_name);
        localStorage.setItem("loggedInName", users.name);
        handleSuccess(res.data.message);

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
    } catch (e) {
      const err =
        e.response?.data?.message || e.message || "Something went wrong";
      // console.log(err);
      handleError(err);
    }
   
  };

  return (
    <div>
      <Navbar name="signup" />
      <div className="container-main">
        <div className="container">
          <div className="container-left">
            <div className="image-box">
              <DotLottieReact
                src="https://lottie.host/9022c24f-7d3e-4f35-ab59-0659cd5fe427/aGU6Ab1VOZ.lottie"
                loop
                autoplay
                className="lottie"
              />
            </div>
          </div>

          <div className="container-right">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                onChange={handlerInput}
                value={userData.name}
                placeholder="Enter your name..."
              />
            </div>

            <div className="form-group">
              <label>User Name</label>
              <input
                type="text"
                name="user_name"
                placeholder="Enter your User name..."
                onChange={handlerInput}
                value={userData.user_name}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                onChange={handlerInput}
                name="email"
                value={userData.email}
                placeholder="Enter your Email..."
              />
            </div>

            <div className="form-group">
              <label>Number</label>
              <input
                type="number"
                onChange={handlerInput}
                name="number"
                value={userData.number}
                placeholder="Enter your Number..."
              />
            </div>

            <div className="form-group hi">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handlerInput}
                value={userData.password}
                placeholder="Enter your Password..."
              />
              <button
                className="input_btm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="button-group">
              <button className="btm_pro" type="submit" onClick={handlerSubmit}>
                Signup
              </button>
              <span className="signup__text">
                Already have an account?
                <Link to={"/login"} className="link">
                  {" "}
                  Login:-{" "}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Signup;
