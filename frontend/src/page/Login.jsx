import React from 'react'
import Navbar from '../components/sigup/Navbar'
import Btm from "../components/sigup/Btm";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from 'react-router-dom';
function Login() {


    const handlerInput =(e)=>{
        console.log(e.target.value)
    }
  return (
     <div>
        <Navbar name="Login"/>
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
                    <label>Email/User Name</label>
                    <input type="text" onChange={handlerInput} />
                  </div>
        
                
        
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password"  onChange={handlerInput}/>
                  </div>
        
                  <div className="button-group">
                    
                    <Btm sigup="Login" />
                    <Link to={"/signup"} className="link" > -:Signup </Link>
                  </div>
        
                </div>
        
              </div>
            </div>
        
      
    </div>
  )
}

export default Login
