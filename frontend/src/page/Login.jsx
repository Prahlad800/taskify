import {API_BASE_URL} from '../util/api';
import React from "react";
import Navbar from "../components/sigup/Navbar";
import { useState } from "react";
import AuthArt from "../components/AuthArt";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../util/error";
import axios from "axios";

function Login() {
  const baseURL = API_BASE_URL;
  
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [userData, setUserData] = useState({
    identifier: "",

    password: "",
  });

  const handlerInput = (e) => {
    // console.log(e.target.value)
    const { name, value } = e.target;
    const copyUserData = { ...userData, [name]: value };
    setUserData(copyUserData);
  };
  const handlerSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = userData;
    // console.log(userData);
    if (!identifier.trim() || !password) {
      return handleError("All fields required");
    }

    try {
      const trimmedIdentifier = identifier.trim();
      const identity = trimmedIdentifier.includes("@")
        ? { email: trimmedIdentifier.toLowerCase() }
        : { user_name: trimmedIdentifier };
      const res = await axios.post(`${baseURL}/user/login`, {
        ...identity,
        password,
      });

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
      <Navbar name="Login" />
      <div className="container-main">
        <div className="container">
          <div className="container-left">
            <AuthArt />
          </div>

          <form className="container-right" onSubmit={handlerSubmit}><div className="form-intro"><span className="eyebrow">YOUR PERSONAL WORKSPACE</span><h2>Welcome back.</h2><p>A clear mind starts with an organized space.</p></div>
            <div className="form-group">
              <label htmlFor="identifier">Email or username</label><input id="identifier"
                type="text"
                name="identifier"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                value={userData.identifier}
                placeholder="Enter your email or username..."
                onChange={handlerInput}
              />
            </div>

            <div className="form-group hi">
              <label htmlFor="password">Password</label><input id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password" name="password"
                value={userData.password}
                placeholder="Enter your password..."
                onChange={handlerInput}
              />
              <button
                type="button" className="input_btm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="button-group">
              <button className="btm_pro" type="submit">
                Login
              </button>
              <span className="login__footer">
                New to Taskify?{" "}
                <Link to={"/signup"} className="link">
                  {" "}
                  Create an account{" "}
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
