import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {createReminderWorker} from './reminder_worker.js';
export const allowedOrigins=['http://localhost:5173','http://127.0.0.1:5173','https://taskify-notes-task.vercel.app','https://taskify-abw.pages.dev'];
export function attachRealtime(server,{secret=()=>process.env.JWT_KEY,reminderIntervalMs=5000,wsEngine}={}){
 const io=new Server(server,{...(wsEngine?{wsEngine}:{}),cors:{origin:allowedOrigins,credentials:true},allowRequest:(req,done)=>done(null,!req.headers.origin||allowedOrigins.includes(req.headers.origin)),maxHttpBufferSize:1024*1024});
 io.use((socket,next)=>{try{const payload=jwt.verify(socket.handshake.auth?.token,secret(),{algorithms:['HS256']});if(!mongoose.isValidObjectId(payload._id))throw Error();socket.data.userId=String(payload._id);socket.data.expiresAt=payload.exp;next();}catch{next(new Error('Authentication required'))}});
 const reminders=createReminderWorker(io,{intervalMs:reminderIntervalMs});
 io.on('connection',socket=>{socket.join('user:'+socket.data.userId);socket.emit('realtime:ready');const expiry=socket.data.expiresAt?setTimeout(()=>socket.disconnect(true),Math.max(0,socket.data.expiresAt*1000-Date.now())):null;expiry?.unref();socket.on('disconnect',()=>clearTimeout(expiry));reminders.run().catch(()=>console.error('Reminder check failed'));});
 function mutationEvents(kind){return(req,res,next)=>{const original=res.json.bind(res);res.json=body=>{
   if(req.user?._id&&['POST','PUT','PATCH','DELETE'].includes(req.method)&&res.statusCode>=200&&res.statusCode<300&&body?.success){
    const item=body.data?.toObject?body.data.toObject():body.data;
    const id=String(item?._id||req.params.id||'');
    if(id){let room=io.to('user:'+req.user._id);const source=io.sockets.sockets.get(req.get('X-Realtime-Client'));if(source?.data.userId===String(req.user._id))room=room.except(source.id);room.emit(kind+':changed',{id,action:req.method==='DELETE'?'delete':req.method==='POST'?'create':'update',item:item||null});}
   }
   return original(body);
  };next()}}
 return {io,reminders,mutationEvents,close:async()=>{reminders.stop();await new Promise(resolve=>io.close(resolve));}};
}
