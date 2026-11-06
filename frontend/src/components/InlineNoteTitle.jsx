import {useEffect,useRef,useState} from 'react';
import {createNoteAutosave} from '../util/noteAutosave';
export default function InlineNoteTitle({title,onSave,disabled=false}){
 const [draft,setDraft]=useState(title||'');const [status,setStatus]=useState('saved');
 const draftRef=useRef(title||''),callback=useRef(onSave),mounted=useRef(true),saver=useRef(null),submitted=useRef(title||'');callback.current=onSave;
 if(!saver.current)saver.current=createNoteAutosave({initialContent:title||'',onState:state=>{if(mounted.current)setStatus(state)},save:async value=>{submitted.current=value;const result=await callback.current(value);if(mounted.current&&draftRef.current===value&&result?.title){draftRef.current=result.title;setDraft(result.title)}}});
 useEffect(()=>{if(!saver.current.isDirty()||draftRef.current===submitted.current){draftRef.current=title||'';setDraft(title||'')}},[title]);
 useEffect(()=>{mounted.current=true;const warn=event=>{if(saver.current.isDirty()){event.preventDefault();event.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>{mounted.current=false;window.removeEventListener('beforeunload',warn);saver.current.flush().catch(()=>{})}},[]);
 function flush(){saver.current.flush().catch(()=>{})}
 return <div className="inline-note-title"><label>Title<input aria-label="Note title" placeholder="Write a title..." maxLength={200} value={draft} disabled={disabled} onChange={event=>{draftRef.current=event.target.value;setDraft(event.target.value);saver.current.change(event.target.value)}} onBlur={flush} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.currentTarget.blur()}}}/></label><span className={'title-save-state '+status} role="status">{status==='saving'?'Saving title...':status==='pending'?'Unsaved title':status==='error'?<>Could not save <button type="button" onClick={flush}>Retry</button></>:''}</span></div>
}
