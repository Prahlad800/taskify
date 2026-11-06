import {Note} from '../module/notes.js';
import {Todo} from '../module/todo.js';
export function createReminderWorker(io,{intervalMs=5000,now=()=>new Date()}={}){
 let running=false;
 async function run(){if(running)return;running=true;try{
  const ids=[...io.of('/').adapter.rooms.keys()].filter(key=>key.startsWith('user:')).map(key=>key.slice(5));
  if(!ids.length)return;
  for(const [kind,Model,field,extra] of [['note',Note,'reminderAt',{trashedAt:null,archivedAt:null}],['task',Todo,'dueDate',{completed_task:{$ne:true}}]]){
   const date=now();const query={user:{$in:ids},[field]:{$ne:null,$lte:date},reminderNotifiedAt:null,...extra};
   const due=await Model.find(query).sort({[field]:1}).limit(100).select('_id user title '+field);
   for(const item of due){const room='user:'+item.user;if(!io.of('/').adapter.rooms.get(room)?.size)continue;
    const claimed=await Model.findOneAndUpdate({_id:item._id,reminderNotifiedAt:null,[field]:item[field],...extra},{$set:{reminderNotifiedAt:date}},{returnDocument:'after',timestamps:false});
    if(claimed)io.to(room).emit('reminder:due',{kind,id:String(item._id),title:item.title,scheduledAt:item[field],notificationId:kind+':'+item._id+':'+item[field].getTime()});
   }
  }
 }finally{running=false}}
 const timer=setInterval(()=>run().catch(()=>console.error('Reminder check failed')),intervalMs);timer.unref();
 return {run,stop:()=>clearInterval(timer)};
}
