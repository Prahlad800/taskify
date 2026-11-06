import express from 'express';
import {createServer} from 'node:http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './router/user_router.js';
import notesRouter from './router/notes_router.js';
import taskRouter from './router/task_router.js';
import {attachRealtime,allowedOrigins} from './services/realtime.js';
export function createApplication(options={}){
 const app=express(),server=createServer(app);const realtime=attachRealtime(server,options);
 if(options.clientIp)app.use((req,_res,next)=>{Object.defineProperty(req,'ip',{value:options.clientIp(req),configurable:true});next();});
 app.use(cors({origin:allowedOrigins,credentials:true}));app.use(express.json({limit:'1mb'}));app.use(cookieParser());
 app.get('/j',(_req,res)=>res.json({name:'hello server',realtime:true}));app.get('/',(_req,res)=>res.send('hello server'));
 app.use('/user',userRouter);app.use('/home',realtime.mutationEvents('note'),notesRouter);app.use('/task',realtime.mutationEvents('task'),taskRouter);
 return {app,server,...realtime};
}
