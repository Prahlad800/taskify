import React from "react";
import Navbar from "../components/sigup/Navbar";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../util/error";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [userData, setUserData] = useState({
    email: "",

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
    const { email, password } = userData;
    // console.log(userData);
    if (!email || !password) {
      return handleError("All fields required");
    }

    try {
      const res = await axios.post(
        "https://taskify-gcxc.onrender.com/user/login",
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
      <Navbar name="Login" />
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
              <label>Email</label>

              <input
                type="text"
                name="email"
                value={userData.email}
                placeholder="Enter your email..."
                onChange={handlerInput}
              />
            </div>

            <div className="form-group hi">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                placeholder="Enter your password..."
                onChange={handlerInput}
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
              <span className="login__footer">
                Doesn't have an account?{" "}
                <Link to={"/signup"} className="link">
                  {" "}
                  -:Signup{" "}
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

export default Login;
