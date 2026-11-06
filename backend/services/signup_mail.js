import nodemailer from 'nodemailer';
export function mailConfiguration(){
 const {SMTP_HOST,SMTP_USER,SMTP_PASS,SMTP_FROM}=process.env;
 if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM){const e=new Error('Signup email is not configured. Please contact the administrator.');e.status=503;throw e;}
 const port=Number(process.env.SMTP_PORT || 465);
 if(!Number.isInteger(port)||port<1||port>65535){const e=new Error('Signup email configuration is invalid.');e.status=503;throw e;}
 return {host:SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:SMTP_USER,pass:SMTP_PASS},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true};
}
export async function sendSignupOtp({email,code}){
 const transport=nodemailer.createTransport(mailConfiguration());
 const result=await transport.sendMail({from:process.env.SMTP_FROM,to:email,subject:'Your Taskify signup verification code',text:'Your Taskify verification code is '+code+'. It expires in 10 minutes. Do not share this code. If you did not request this, ignore this email.',html:'<div style="font-family:Arial,sans-serif;max-width:480px;padding:32px;color:#28243d"><h2 style="color:#6654d9">Taskify</h2><h3>Verify your email</h3><p>Use this code to finish creating your account:</p><p style="font-size:32px;letter-spacing:8px;font-weight:bold">'+code+'</p><p>This code expires in 10 minutes. Do not share it.</p><p>If you did not request this, you can ignore this email.</p></div>'});
 if(!result.accepted?.length)throw new Error('Email was not accepted by the mail server.');
}
