import React from "react";
import Navbar from "../components/sigup/Navbar";
import Btm from "../components/sigup/Btm";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../components/sigup/body.css";
import { Link } from "react-router-dom";

function Signup() {
  return (
    <div>
      <Navbar name="signup"/>
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
              <input type="text" />
            </div>

            <div className="form-group">
              <label>User Name</label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" />
            </div>

            <div className="form-group">
              <label>Number</label>
              <input type="number" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" />
            </div>

            <div className="button-group">
              <Btm sigup="Signup" />
              <Link to={"/login"} className="link" > Login:- </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
