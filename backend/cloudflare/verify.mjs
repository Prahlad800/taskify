import assert from 'node:assert/strict';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import {io} from 'socket.io-client';

const base=process.env.VERIFY_API_URL||'https://backend-taskify.notesnaxa.workers.dev';
for(const path of ['/health','/ready','/j']){
  const response=await fetch(base+path);assert.equal(response.status,200,path);
  console.log(path,await response.json());
}
const denied=await fetch(base+'/home');
assert.ok([401,403].includes(denied.status));
const cors=await fetch(base+'/user/login',{method:'OPTIONS',headers:{Origin:'https://taskify-notes-task.vercel.app','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,authorization'}});
assert.equal(cors.headers.get('access-control-allow-origin'),'https://taskify-notes-task.vercel.app');
console.log('Protected route and frontend CORS passed');
const invalidSignup=await fetch(base+'/user/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
assert.equal(invalidSignup.status,400);
assert.equal((await invalidSignup.json()).success,false);
console.log('Signup validation and rate-limit middleware passed');
async function socketCheck(transports,token,expected){
  const socket=io(base,{transports,auth:{token},reconnection:false,timeout:15000});
  try{await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Socket verification timed out')),20000);
    socket.on('realtime:ready',()=>{clearTimeout(timer);expected==='ready'?resolve():reject(new Error('Invalid token accepted'));});
    socket.on('connect_error',error=>{clearTimeout(timer);expected==='denied'&&error.message==='Authentication required'?resolve():reject(error);});
  });}finally{socket.disconnect();}
  console.log(transports.join(','),expected,'passed');
}
const token=jwt.sign({_id:'000000000000000000000001'},process.env.JWT_KEY,{expiresIn:60});
for(const path of ['/home','/task']) {
  const response=await fetch(base+path,{headers:{Authorization:'Bearer '+token}});
  assert.equal(response.status,200,path+' database read');
  assert.equal((await response.json()).success,true);
  console.log(path,'authenticated database read passed');
}
await socketCheck(['websocket'],token,'ready');
await socketCheck(['polling'],token,'ready');
await socketCheck(['websocket'],'invalid','denied');
