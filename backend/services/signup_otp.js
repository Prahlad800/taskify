import {randomInt,randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
import bcrypt from 'bcrypt';
import {User} from '../module/user.js';
import {SignupOtp} from '../module/signup_otp.js';
import {sendSignupOtp,mailConfiguration} from './signup_mail.js';
export const OTP_TTL_SECONDS=600;
export const OTP_RESEND_SECONDS=60;
const MAX_ATTEMPTS=5;
const fail=(status,message,retryAfter)=>Object.assign(new Error(message),{status,retryAfter});
function digest(email,challengeId,code){return createHmac('sha256',process.env.OTP_SECRET || process.env.JWT_KEY).update(email+':'+challengeId+':'+code).digest('hex');}
const emailQuery=email=>new RegExp('^'+email.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i');
export function createSignupService({sendMail=sendSignupOtp,assertMail=mailConfiguration,now=()=>new Date()}={}){
 async function available(email,user_name){if(await User.exists({$or:[{email:emailQuery(email)},{user_name}]}))throw fail(409,'An account with this email or username already exists. Please sign in.');}
 async function issue(details){
  assertMail();
  if(!process.env.JWT_KEY)throw fail(503,'Signup is temporarily unavailable.');
  const date=now();const challengeId=randomBytes(24).toString('hex');const code=String(randomInt(100000,1000000));
  const record={...details,challengeId,otpHash:digest(details.email,challengeId,code),attempts:0,status:'sending',lastSentAt:date,expiresAt:new Date(date.getTime()+OTP_TTL_SECONDS*1000)};
  try{await SignupOtp.findOneAndUpdate({email:details.email,status:{$ne:'verifying'},$or:[{lastSentAt:{$lte:new Date(date.getTime()-OTP_RESEND_SECONDS*1000)}},{expiresAt:{$lte:date}}]},{$set:record},{upsert:true,returnDocument:'after',runValidators:true});}
  catch(e){if(e.code===11000)throw fail(429,'Please wait before requesting another code.',OTP_RESEND_SECONDS);throw e;}
  try{await sendMail({email:details.email,code});await SignupOtp.updateOne({email:details.email,challengeId,status:'sending'},{$set:{status:'ready'}});}
  catch{await SignupOtp.deleteOne({email:details.email,challengeId,status:'sending'});throw fail(503,'Unable to send the verification email. Please try again shortly.');}
  return {email:details.email,challengeId,expiresIn:OTP_TTL_SECONDS,resendAfter:OTP_RESEND_SECONDS};
 }
 return {
  async request(data){const email=data.email.trim().toLowerCase();await available(email,data.user_name);const passwordHash=await bcrypt.hash(data.password,10);return issue({email,name:data.name,user_name:data.user_name,number:data.number,passwordHash});},
  async resend({email,challengeId}){email=email.trim().toLowerCase();const pending=await SignupOtp.findOne({email,challengeId,status:'ready'});if(!pending)throw fail(400,'Verification session not found. Please start signup again.');await available(email,pending.user_name);return issue({email,name:pending.name,user_name:pending.user_name,number:pending.number,passwordHash:pending.passwordHash});},
  async verify({email,challengeId,otp}){
   email=email.trim().toLowerCase();const date=now();
   const pending=await SignupOtp.findOneAndUpdate({email,challengeId,status:'ready',expiresAt:{$gt:date},attempts:{$lt:MAX_ATTEMPTS}},{$inc:{attempts:1}},{returnDocument:'after'});
   if(!pending)throw fail(400,'Code expired, already used, or attempt limit reached. Request a new code.');
   const expected=Buffer.from(pending.otpHash,'hex'),actual=Buffer.from(digest(email,challengeId,otp),'hex');
   if(!timingSafeEqual(expected,actual))throw fail(400,pending.attempts>=MAX_ATTEMPTS?'Too many incorrect codes. Request a new code.':'Incorrect code. Please try again.');
   const claimed=await SignupOtp.findOneAndUpdate({_id:pending._id,challengeId,status:'ready',attempts:{$lte:MAX_ATTEMPTS},expiresAt:{$gt:now()}},{$set:{status:'verifying'}},{returnDocument:'after'});
   if(!claimed)throw fail(400,'This code is no longer available. Request a new code.');
   try{await available(email,claimed.user_name);const user=await User.create({name:claimed.name,email,user_name:claimed.user_name,number:claimed.number,password:claimed.passwordHash,emailVerifiedAt:now()});await SignupOtp.deleteOne({_id:claimed._id,challengeId});return user;}
   catch(e){await SignupOtp.updateOne({_id:claimed._id,challengeId,status:'verifying'},{$set:{status:'ready'}});if(e.code===11000)throw fail(409,'This account already exists. Please sign in.');throw e;}
  }
 };
}
