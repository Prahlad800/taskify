import {API_BASE_URL} from '../util/api';
import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import axios from 'axios';
import {ToastContainer} from 'react-toastify';
import Navbar from '../components/sigup/Navbar';
import AuthArt from '../components/AuthArt';
import '../components/sigup/body.css';
import {handleError,handleSuccess} from '../util/error';

export default function Signup(){
 const baseURL = API_BASE_URL;
 const navigate=useNavigate();
 const [userData,setUserData]=useState({name:'',user_name:'',email:'',number:'',password:''});
 const [showPassword,setShowPassword]=useState(false);
 const [challenge,setChallenge]=useState(null);
 const [otp,setOtp]=useState('');
 const [busy,setBusy]=useState(false);
 const [seconds,setSeconds]=useState(0);
 const [error,setError]=useState('');
 useEffect(()=>{if(!seconds)return;const timer=setTimeout(()=>setSeconds(value=>Math.max(0,value-1)),1000);return ()=>clearTimeout(timer)},[seconds]);
 const change=e=>setUserData({...userData,[e.target.name]:e.target.value});
 function showError(e){const message=e.response?.data?.message||'Could not reach the server. Please try again.';setError(message);handleError(message);if(e.response?.data?.retryAfter)setSeconds(e.response.data.retryAfter);}
 function acceptChallenge(data){setChallenge({email:data.email,challengeId:data.challengeId});setSeconds(data.resendAfter);setOtp('');handleSuccess(data.message);}
 async function submit(e){e.preventDefault();if(busy)return;setBusy(challenge?'verify':'request');setError('');try{
  if(!challenge){const {data}=await axios.post(baseURL+'/user/signup',userData);acceptChallenge(data);}
  else{const {data}=await axios.post(baseURL+'/user/signup/verify-otp',{...challenge,otp});localStorage.setItem('token',data.jwtToken);localStorage.setItem('loggedInUserName',data.users.user_name);localStorage.setItem('loggedInName',data.users.name);handleSuccess(data.message);navigate('/home');}
 }catch(e){showError(e)}finally{setBusy(false)}}
 async function resend(){if(busy||seconds)return;setBusy('resend');setError('');try{const {data}=await axios.post(baseURL+'/user/signup/resend-otp',challenge);acceptChallenge(data)}catch(e){showError(e)}finally{setBusy(false)}}
 return <div><Navbar name="signup"/><div className="container-main"><div className="container"><div className="container-left"><AuthArt/></div><form className="container-right" onSubmit={submit} aria-busy={!!busy}>
 <div className="form-intro"><span className="eyebrow">YOUR PERSONAL WORKSPACE</span><h2>{challenge?'Check your inbox.':'A fresh start awaits.'}</h2><p>{challenge?'Enter the 6-digit code sent to your email.':'Create your account and verify your email to get started.'}</p></div>
 {challenge?<><div className="otp-destination">Sent to <strong>{challenge.email}</strong><span>The code expires in 10 minutes. Check spam too.</span></div><div className="form-group"><label htmlFor="signup-otp">Verification code</label><input autoFocus id="signup-otp" className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,''))} placeholder="000000" required disabled={busy}/></div></>:<>
 <div className="form-group"><label htmlFor="signup-name">Name</label><input id="signup-name" name="name" autoComplete="name" value={userData.name} onChange={change} minLength={3} maxLength={100} required disabled={busy} placeholder="Your full name"/></div>
 <div className="form-group"><label htmlFor="signup-username">Username</label><input id="signup-username" name="user_name" autoComplete="username" value={userData.user_name} onChange={change} minLength={4} maxLength={20} required disabled={busy} placeholder="Choose a username"/></div>
 <div className="form-group"><label htmlFor="signup-email">Email</label><input id="signup-email" type="email" name="email" autoComplete="email" value={userData.email} onChange={change} required disabled={busy} placeholder="you@example.com"/></div>
 <div className="form-group"><label htmlFor="signup-number">Phone number</label><input id="signup-number" type="tel" inputMode="numeric" name="number" autoComplete="tel" value={userData.number} onChange={change} pattern="[0-9]{10}" maxLength={10} required disabled={busy} placeholder="10-digit mobile number"/></div>
 <div className="form-group hi"><label htmlFor="signup-password">Password</label><input id="signup-password" type={showPassword?'text':'password'} name="password" autoComplete="new-password" value={userData.password} onChange={change} minLength={6} maxLength={100} required disabled={busy} placeholder="Create your password"/><button type="button" className="input_btm" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Hide':'Show'}</button></div><p className="password-hint">Use 6+ characters with an uppercase letter, number, and symbol.</p>
 </>}
 {error&&<p className="signup-error" role="alert">{error}</p>}
 <div className="button-group"><button className="btm_pro" type="submit" disabled={busy||(!!challenge&&otp.length!==6)}>{busy?(busy==='verify'?'Verifying...':'Sending code...'):(challenge?'Verify & create account':'Send verification code')}</button>
 {challenge&&<div className="otp-actions"><button type="button" className="otp-link" onClick={resend} disabled={busy||seconds>0}>{seconds>0?'Resend code in '+seconds+'s':'Resend code'}</button><button type="button" className="otp-link" disabled={busy} onClick={()=>{setChallenge(null);setOtp('');setError('')}}>Change signup details</button></div>}
 <span className="signup__text">Already have an account? <Link to="/login" className="link">Sign in</Link></span></div>
 </form></div></div><ToastContainer/></div>;
}
