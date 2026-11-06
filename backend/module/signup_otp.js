import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 email:{type:String,required:true,unique:true},
 challengeId:{type:String,required:true},
 name:{type:String,required:true}, user_name:{type:String,required:true}, number:{type:String,required:true},
 passwordHash:{type:String,required:true}, otpHash:{type:String,required:true},
 attempts:{type:Number,default:0}, status:{type:String,enum:['sending','ready','verifying'],required:true},
 lastSentAt:{type:Date,required:true}, expiresAt:{type:Date,required:true,index:{expires:0}}
},{timestamps:true});
export const SignupOtp=mongoose.model('SignupOtp',schema);
