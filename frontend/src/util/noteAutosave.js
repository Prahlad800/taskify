// Serialize writes so an older request can never overwrite a newer draft.
export function createNoteAutosave({initialContent='',save,onState=()=>{},delay=800}){
 let content=initialContent,saved=initialContent,timer=null,running=null,cancelled=false;
 const clear=()=>{clearTimeout(timer);timer=null};
 const dirty=()=>content!==saved;
 function flush(){
  clear();
  if(cancelled)return Promise.resolve();
  if(running)return running.then(()=>dirty()?flush():undefined);
  if(!dirty()){onState('saved');return Promise.resolve();}
  running=(async()=>{
   while(dirty()&&!cancelled){const snapshot=content;onState('saving');try{await save(snapshot);saved=snapshot;}catch(error){onState('error');throw error;}}
   if(!cancelled)onState('saved');
  })().finally(()=>{running=null});
  return running;
 }
 return {change(value){if(cancelled)return;content=value;clear();onState(dirty()||running?'pending':'saved');if(dirty())timer=setTimeout(()=>{flush().catch(()=>{})},delay)},flush,isDirty:()=>dirty()||!!running,cancel(){cancelled=true;clear()}};
}
