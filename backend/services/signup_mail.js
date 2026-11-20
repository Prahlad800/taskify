import nodemailer from 'nodemailer';
const emailContent=code=>({subject:'Your Taskify signup verification code',text:'Your Taskify verification code is '+code+'. It expires in 10 minutes. Do not share this code. If you did not request this, ignore this email.',html:'<div style="font-family:Arial,sans-serif;max-width:480px;padding:32px;color:#28243d"><h2 style="color:#6654d9">Taskify</h2><h3>Verify your email</h3><p>Use this code to finish creating your account:</p><p style="font-size:32px;letter-spacing:8px;font-weight:bold">'+code+'</p><p>This code expires in 10 minutes. Do not share it.</p><p>If you did not request this, you can ignore this email.</p></div>'});
export function mailConfiguration(){
 const {SMTP_HOST,SMTP_USER,SMTP_PASS,SMTP_FROM}=process.env;
 if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM){const e=new Error('Signup email is not configured. Please contact the administrator.');e.status=503;throw e;}
 const port=Number(process.env.SMTP_PORT || 465);
 if(!Number.isInteger(port)||port<1||port>65535){const e=new Error('Signup email configuration is invalid.');e.status=503;throw e;}
 return {host:SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:SMTP_USER,pass:SMTP_PASS},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true};
}
export async function sendSignupOtp({email,code}){
 const content=emailContent(code);
 if(process.env.RESEND_API_KEY){
  const from=process.env.EMAIL_FROM||'onboarding@resend.dev';
  if(!from)throw Object.assign(new Error('Signup email sender is not configured.'),{status:503});
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],...content}),signal:AbortSignal.timeout(15000)});
  if(!response.ok){const error=new Error('Resend email API rejected the message.');error.code='ERESEND';error.responseCode=response.status;throw error;}
  return;
 }
 if(process.env.CLOUDFLARE_WORKER){const e=new Error('Cloudflare Worker requires RESEND_API_KEY to send signup email.');e.code='EMAIL_HTTP_PROVIDER_REQUIRED';throw e;}
 const transport=nodemailer.createTransport(mailConfiguration());
 const result=await transport.sendMail({from:process.env.SMTP_FROM,to:email,...content});
 if(!result.accepted?.length)throw new Error('Email was not accepted by the mail server.');
 transport.close();
}
