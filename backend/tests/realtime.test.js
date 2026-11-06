import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {io as connect} from 'socket.io-client';
import {MongoMemoryServer} from 'mongodb-memory-server-core';
import {createApplication} from '../app.js';
import {Note} from '../module/notes.js';
import {Todo} from '../module/todo.js';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function next(client,event,timeout=4000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{client.off(event,done);reject(Error('Timed out waiting for '+event))},timeout);const done=data=>{clearTimeout(timer);resolve(data)};client.once(event,done)})}
test('authenticated live updates and due reminders',async t=>{
 process.env.JWT_KEY='realtime-test-secret-never-use-in-production';
 const mongo=await MongoMemoryServer.create({binary:{version:'7.0.14'},instance:{launchTimeout:30000}});
 const clients=[];let application;
 try{
  await mongoose.connect(mongo.getUri(),{dbName:'taskify_realtime_tests'});await Promise.all([Note.init(),Todo.init()]);
  application=createApplication({reminderIntervalMs:100});await new Promise(resolve=>application.server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+application.server.address().port;
  const userA=new mongoose.Types.ObjectId(),userB=new mongoose.Types.ObjectId();const tokenA=jwt.sign({_id:String(userA)},process.env.JWT_KEY,{expiresIn:'1h'}),tokenB=jwt.sign({_id:String(userB)},process.env.JWT_KEY,{expiresIn:'1h'});
  function client(token){const c=connect(url,{autoConnect:false,auth:{token},transports:['websocket'],forceNew:true,reconnection:false});clients.push(c);return c}
  async function online(token){const c=client(token);const connected=next(c,'connect');c.connect();await connected;return c}
  async function request(path,method,body,token=tokenA,source){const r=await fetch(url+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(source?{'X-Realtime-Client':source}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,...data}}
  await t.test('missing and expired tokens cannot open a socket',async()=>{for(const token of [undefined,'bad-token',jwt.sign({_id:String(userA)},process.env.JWT_KEY,{expiresIn:-1})]){const c=client(token);const refused=next(c,'connect_error');c.connect();assert.match((await refused).message,/Authentication/);c.disconnect()}});
  const a1=await online(tokenA),a2=await online(tokenA),b=await online(tokenB);let leaked=0,selfEvents=0;b.on('note:changed',()=>leaked++);a1.on('note:changed',()=>selfEvents++);
  let noteId,taskId;
  await t.test('note creation updates the other tab only, with no cross-user leak',async()=>{const event=next(a2,'note:changed');const created=await request('/home','POST',{title:'Live note'},tokenA,a1.id);assert.equal(created.status,201);noteId=created.data._id;const payload=await event;assert.equal(payload.id,noteId);assert.equal(payload.action,'create');assert.equal(payload.item.title,'Live note');await wait(120);assert.equal(leaked,0);assert.equal(selfEvents,0)});
  await t.test('edit and deletion events reach other tabs',async()=>{let event=next(a1,'note:changed');await request('/home/'+noteId,'PUT',{content:'Changed in tab two'},tokenA,a2.id);assert.equal((await event).item.content,'Changed in tab two');event=next(a2,'note:changed');await request('/home/'+noteId,'DELETE',undefined,tokenA,a1.id);assert.equal((await event).action,'delete')});
  await t.test('task create and item updates are live',async()=>{let event=next(a2,'task:changed');const created=await request('/task','POST',{},tokenA,a1.id);taskId=created.data._id;assert.equal((await event).action,'create');event=next(a2,'task:changed');await request('/task/'+taskId,'PUT',{text:'Live task item'},tokenA,a1.id);const changed=await event;assert.equal(changed.item.task[0].text,'Live task item');event=next(a2,'task:changed');await request('/task/'+taskId+'/'+changed.item.task[0]._id,'PUT',{completed_todo:true},tokenA,a1.id);assert.equal((await event).item.task[0].completed_todo,true)});
  await t.test('note reminders notify once and rescheduling rearms them',async()=>{const created=await request('/home','POST',{title:'Due note'});const id=created.data._id;let event=next(a1,'reminder:due');await request('/home/'+id+'/settings','PATCH',{reminderAt:new Date(Date.now()-5000).toISOString()});const first=await event;assert.equal(first.id,id);assert.equal(first.kind,'note');let repeats=0;const count=()=>repeats++;a1.on('reminder:due',count);await wait(350);assert.equal(repeats,0);a1.off('reminder:due',count);assert.ok((await Note.findById(id)).reminderNotifiedAt);event=next(a1,'reminder:due');await request('/home/'+id+'/settings','PATCH',{reminderAt:new Date(Date.now()-1000).toISOString()});assert.notEqual((await event).notificationId,first.notificationId)});
  await t.test('task reminders notify only their owner and validate ownership',async()=>{const event=next(a1,'reminder:due');const dueDate=new Date(Date.now()-1000).toISOString();assert.equal((await request('/task/'+taskId+'/reminder','PATCH',{dueDate},tokenB)).status,404);assert.equal((await request('/task/'+taskId+'/reminder','PATCH',{dueDate})).status,200);const reminder=await event;assert.equal(reminder.id,taskId);assert.equal(reminder.kind,'task');assert.ok((await Todo.findById(taskId)).reminderNotifiedAt)});
  await t.test('offline reminders remain pending and arrive on reconnect',async()=>{b.disconnect();await wait(80);const pending=await Note.create({user:userB,title:'Offline reminder',reminderAt:new Date(Date.now()-5000)});await wait(250);assert.equal((await Note.findById(pending.id)).reminderNotifiedAt,null);const c=client(tokenB);const event=next(c,'reminder:due');c.connect();assert.equal((await event).id,pending.id)});
  await t.test('trashed and archived notes and completed tasks do not notify',async()=>{const due=new Date(Date.now()-5000);const trash=await Note.create({user:userA,title:'Trash',reminderAt:due,trashedAt:new Date()});const archive=await Note.create({user:userA,title:'Archive',reminderAt:due,archivedAt:new Date()});const done=await Todo.create({user:userA,title:'Done',dueDate:due,completed_task:true});await wait(350);assert.equal((await Note.findById(trash.id)).reminderNotifiedAt,null);assert.equal((await Note.findById(archive.id)).reminderNotifiedAt,null);assert.equal((await Todo.findById(done.id)).reminderNotifiedAt,null)});
 }finally{for(const client of clients)client.disconnect();if(application)await application.close();await mongoose.disconnect();await mongo.stop();}
});
