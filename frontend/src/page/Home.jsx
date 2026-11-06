import {API_BASE_URL} from '../util/api';
import {useRealtimeEvent,mergeLiveItem} from "../components/RealtimeProvider";
import {newestUpdatedFirst,formatListDate} from "../util/listDates";
import WorkspaceLayout from "../components/WorkspaceLayout";
import WorkspaceNav from "../components/WorkspaceNav";
import Icon from "../components/WorkspaceIcon";
import ItemActions from "../components/ItemActions";
import MarkdownNoteEditor from "../components/MarkdownNoteEditor";
import { createNoteAutosave } from "../util/noteAutosave";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import React, { useState, useEffect, useRef } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../util/error";

function Home() {
  const baseURL = API_BASE_URL;
  const navigate = useNavigate();
  const [params,setParams]=useSearchParams();
  const view=['notes','favorites','reminders','archive','trash'].includes(params.get('view'))?params.get('view'):'notes';
  const viewTitle={notes:'My Notes',favorites:'Favorites',reminders:'Reminders',archive:'Archive',trash:'Trash'}[view];
  const [search,setSearch]=useState('');
  const [reminderNote,setReminderNote]=useState(null);
  const [reminderDate,setReminderDate]=useState('');
  const [organizing,setOrganizing]=useState(false);

  // USER INFO
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");

  // NOTES STATE
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteDetails, setNoteDetails] = useState(null);
  //  const [data, setData] = useState(null);

  const autosave = useRef(null);
  const mounted = useRef(true);
  const loadingNote = useRef(0);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const warn = (event) => {if(autosave.current?.isDirty()){event.preventDefault();event.returnValue='';}};
    const resume = () => {autosave.current?.flush().catch(()=>{});};
    window.addEventListener('beforeunload',warn);
    window.addEventListener('online',resume);
    return () => {mounted.current=false;loadingNote.current++;window.removeEventListener('beforeunload',warn);window.removeEventListener('online',resume);autosave.current?.flush().catch(()=>{});};
  },[]);

  // UI STATE
  const [notesLoading, setNotesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");

  const filteredNotes=newestUpdatedFirst(notes.filter(note=>{
    if(view==='trash')return !!note.trashedAt;
    if(note.trashedAt)return false;
    if(view==='archive')return !!note.archivedAt;
    if(note.archivedAt)return false;
    if(view==='favorites'&&!note.pinned)return false;
    if(view==='reminders'&&!note.reminderAt)return false;
    return true;
  }).filter(note=>(note.title+' '+(note.content||'')).toLowerCase().includes(search.toLowerCase())));
  function snippet(content=''){return content.replace(/[#*_`>~|]/g,'').replace(/\s+/g,' ').trim().slice(0,100)||'A fresh page. Start writing...';}
  async function navigateView(next){try{await autosave.current?.flush();if(next==='tasks'){navigate('/task');return}setParams(next==='notes'?{}:{view:next});setSearch('');}catch{handleError('Save your note before leaving.');}}
  async function organize(id,settings){await autosave.current?.flush();const {data}=await axios.patch(baseURL+'/home/'+id+'/settings',settings,{headers:{Authorization:'Bearer '+getToken()}});setNotes(current=>current.map(item=>item._id===id?data.data:item));setNoteDetails(current=>current?._id===id?data.data:current);if(settings.trashed&&selectedNote?._id===id){autosave.current?.cancel();autosave.current=null;setSelectedNote(null);setNoteContent('');}return data.data;}
  async function organizeAction(id,settings){try{await organize(id,settings);handleSuccess('Note updated');}catch(e){handleError(e.response?.data?.message||'Could not update note.');}}
  async function trashNote(id){try{await organize(id,{trashed:true});handleSuccess('Moved to Trash');return true;}catch{handleError('Could not move note to Trash');return false;}}
  async function saveReminder(event){event.preventDefault();if(!reminderNote||!reminderDate)return;setOrganizing(true);try{await organize(reminderNote._id,{reminderAt:new Date(reminderDate).toISOString()});setReminderNote(null);handleSuccess('Reminder saved');}catch{handleError('Could not save reminder');}finally{setOrganizing(false)}}
  function noteActions(note){return note.trashedAt?[{label:'Restore note',onClick:()=>organizeAction(note._id,{trashed:false})}]:[{label:note.pinned?'Remove favorite':'Add to favorites',onClick:()=>organizeAction(note._id,{pinned:!note.pinned})},{label:note.archivedAt?'Unarchive':'Archive',onClick:()=>organizeAction(note._id,{archived:!note.archivedAt})},{label:'Set reminder',onClick:()=>{setReminderNote(note);setReminderDate('')}},...(note.reminderAt?[{label:'Remove reminder',onClick:()=>organizeAction(note._id,{reminderAt:null})}]:[])];}

  // TOKEN HELPER
  const getToken = () => localStorage.getItem("token");

  // FETCH NOTES
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      // setNotesLoading(true)
      const res = await axios.get(`${baseURL}/home`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setNotes(res.data.data);

      // console.log(res.data.data)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleError("Token expired or invalid", error);

        // âŒ remove token
        localStorage.removeItem("token");

        // ðŸ” redirect using react router
        navigate("/login");
      } else {
        handleError("Failed to fetch notes", error);
      }
      handleError("Failed to fetch notes", error);
    } finally {
      setNotesLoading(false); // ðŸ”¥ ye ALWAYS chalega
    }
    //   console.log("loading:", notesLoading);
    // console.log("notes:", notes);
  };

  const [creating,setCreating]=useState(false);

  // ADD NOTE
  const handleSaveTitle=async()=>{
    if(creating||view==='trash')return;
    setCreating(true);
    try{await autosave.current?.flush();const {data}=await axios.post(baseURL+'/home',{collection:view},{headers:{Authorization:'Bearer '+getToken()}});setNotes(current=>[...current,data.data]);setSearch('');await handleNoteClick(data.data._id);}
    catch(error){handleError(error.response?.data?.message||'Could not create the note.');}
    finally{setCreating(false);}
  };

  const handleNoteClick = async (id) => {
    const request = ++loadingNote.current;
    setNoteLoading(true);
    try {
      // Finish the current note before replacing its editor.
      await autosave.current?.flush();
      const res = await axios.get(baseURL+'/home/'+id,{headers:{Authorization:'Bearer '+getToken()}});
      if(request!==loadingNote.current || !mounted.current)return;
      const note=res.data.data;
      if(!note)throw new Error('Note not found');
      autosave.current?.cancel();
      const initialContent=note.content || '';
      const noteToken=getToken();
      autosave.current=createNoteAutosave({initialContent,
        onState:state=>{if(mounted.current)setSaveStatus(state)},
        save:async content=>{
          const response=await axios.put(baseURL+'/home/'+id,{content},{headers:{Authorization:'Bearer '+noteToken}});
          if(!response.data.success)throw new Error('Save failed');
          const updated=response.data.data;
          if(mounted.current){setNoteDetails(current=>current?._id===id?{...current,...updated}:current);setNotes(current=>current.map(item=>item._id===id?{...item,...updated}:item));}
        }
      });
      setSelectedNote(note);
      setNoteDetails(note);
      setNoteContent(initialContent);
      setSaveStatus('saved');
    } catch(error) {
      if(request===loadingNote.current)handleError('Could not save or load the note. Please retry before switching.');
    } finally {if(request===loadingNote.current && mounted.current)setNoteLoading(false);}
  };
  const changeContent = value => {
    setNoteContent(value);
    autosave.current?.change(value);
  };
  const retrySave = () => {autosave.current?.flush().catch(()=>{});};
  // delete notes
  const handleDeleteNote = async (id) => {
    try {
      await autosave.current?.flush();
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${baseURL}/home/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        handleSuccess("Note deleted");
        if (selectedNote && selectedNote._id === id) {
          autosave.current?.cancel();
          autosave.current=null;

          setSelectedNote(null);
          setNoteContent("");
        }
        fetchNotes();
        return true;
      }
    } catch (error) {
      handleError("Failed to delete note", error);
      return false;
    }
  };

  async function renameItem(id,title,silent=false){await autosave.current?.flush();const {data}=await axios.patch(baseURL+'/home/'+id+'/title',{title},{headers:{Authorization:'Bearer '+getToken()}});setNotes(current=>current.map(item=>item._id===id?{...item,...data.data}:item));setNoteDetails(current=>current?._id===id?{...current,...data.data}:current);if(!silent)handleSuccess('Title updated');return data.data;}
  useRealtimeEvent('note:changed',event=>{
    setNotes(current=>mergeLiveItem(current,event));
    if(selectedNote?._id===event.id){
      if(event.action==='delete'){autosave.current?.cancel();autosave.current=null;setSelectedNote(null);setNoteContent('');handleError('This note was deleted in another tab.');}
      else if(!autosave.current?.isDirty()&&!noteLoading)handleNoteClick(event.id);
      else setNoteDetails(current=>current?._id===event.id?{...current,title:event.item.title,updatedAt:event.item.updatedAt,reminderAt:event.item.reminderAt}:current);
    }
  });
  useRealtimeEvent('realtime:ready',()=>{fetchNotes();if(selectedNote&&!autosave.current?.isDirty())handleNoteClick(selectedNote._id);});

  // LOAD USER + NOTES
  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
    fetchNotes();
  }, []);

  useEffect(()=>{if(!notesLoading&&!selectedNote&&!noteLoading&&filteredNotes.length)handleNoteClick(filteredNotes[0]._id);},[notesLoading]);

  return (
    <div className="workspace-app">
      <Navbar_home searchValue={search} onSearchChange={setSearch} searchLabel="Search notes"
        onHome={()=>navigateView('notes')} onReminders={()=>navigateView('reminders')} reminderCount={notes.filter(note=>note.reminderAt&&!note.trashedAt).length}
        loggedInUserName={loggedInUserName}
        loggedInName={loggedInName}
      />

      <div className="hello">
        <WorkspaceLayout><WorkspaceNav active={view} onNavigate={navigateView}/>
          <WorkspaceSidebar title={viewTitle} selectionKey={selectedNote?._id} navigation={<WorkspaceNav compact active={view} onNavigate={navigateView}/>}>{(closeSidebar) => <>
            <div className="slider-button">
              <button
                className={`silider-button-notes ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                Notes
              </button>
              <Link
                to={"/task"}
                className={`slider-button-signup link ${activeTab === "tasks" ? "active" : ""}`}
                onClick={async (event) => {
                  event.preventDefault();
                  try {await autosave.current?.flush();navigate('/task');}
                  catch {handleError('Your note could not be saved. Retry before leaving.');}
                }}
              >
                Tasks
              </Link>
            </div>

            {view!=='trash'&&<div className="slider-add-notes"><button type="button" className="slider-add-notes_btm" disabled={creating} onClick={handleSaveTitle}>{creating?'Creating...':'+ New note'}</button></div>}

            {/* NOTES LIST */}
            <div className="slider-notes-list">
              {view==='trash'&&<p className="trash-retention-note">Notes are permanently deleted after 30 days in Trash.</p>}<div className="collection-heading"><h2>{viewTitle} ({filteredNotes.length})</h2><span className="list-order-label" title="Latest updated first"><Icon name="sort" size={18}/></span></div>
              <div className="line"></div>
              <div className="scrolbar_web">

              {notesLoading ? (
                <div>
                  <p className="loader">Loading notes...</p>
                  <div className="spinner"></div>
                </div>
              ) : filteredNotes.length === 0 ? (
                <p className="slider-note-not">No notes here yet</p>
              ) : (
                <ul className="slider-note-ul">
                  {filteredNotes.map((note) => (
                    <li
                      key={note._id}
                      className={"slider-note-ls note-card"+(selectedNote?._id===note._id?" selected-note":"")}

                      onClick={() => {
                        handleNoteClick(note._id);
                        closeSidebar();

                      }}
                    >
                      <button type="button" className="note-open-button"><strong>{note.title}</strong><span className="note-card-excerpt">{snippet(note.content)}</span><time className="note-card-time" dateTime={note.updatedAt||note.createdAt}>Updated: {formatListDate(note.updatedAt||note.createdAt)}</time>{view==='trash'&&<span className="note-card-time">Deletes in {Math.max(0,Math.ceil((new Date(note.trashedAt).getTime()+30*86400000-Date.now())/86400000))} days</span>}{view==='reminders'&&note.reminderAt&&<span className="note-card-time">Reminder: {formatListDate(note.reminderAt)}</span>}</button>
                      <ItemActions title={note.title} info={{createdAt:note.createdAt,updatedAt:note.updatedAt,owner:loggedInName||loggedInUserName}} actions={noteActions(note)} recoverable={!note.trashedAt} onRename={title=>renameItem(note._id,title)} onDelete={()=>note.trashedAt?handleDeleteNote(note._id):trashNote(note._id)}/>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          </>}</WorkspaceSidebar>

          {/* RIGHT PANEL */}
          <div className="contener-note-content note-editor-panel">
            {selectedNote ? <>
              {noteDetails.trashedAt&&<div className="note-trash-banner">This note is in Trash.<button type="button" onClick={()=>organizeAction(noteDetails._id,{trashed:false})}>Restore note</button></div>}
              <MarkdownNoteEditor key={selectedNote._id} noteId={selectedNote._id} title={noteDetails.title} onTitleChange={title=>renameItem(selectedNote._id,title,true)} value={noteContent} onChange={changeContent} onBlur={() => {autosave.current?.flush().catch(()=>{});}} disabled={noteLoading}/>
              <div className={'autosave-status '+saveStatus} role="status" aria-live="polite">
                <span className="autosave-dot" aria-hidden="true" />
                <span>{noteLoading?'Opening note...':saveStatus==='saving'?'Saving...':saveStatus==='pending'?'Unsaved changes':saveStatus==='error'?'Could not save. Your changes are still here.':'All changes saved'}</span>
                {saveStatus==='error'&&<button type="button" onClick={retrySave}>Retry</button>}
              </div>
            </> : <div className="empty-editor"><p>Your next great idea starts here. Select a note or create a new one.</p></div>}
          </div>
        </WorkspaceLayout>

        <Bottome_home />
      </div>

      {reminderNote&&<div className="popup-overlay"><form className="popup-box" role="dialog" aria-modal="true" aria-label="Set note reminder" onSubmit={saveReminder}><h3>Remind me about this note</h3><p className="reminder-caption">{reminderNote.title}</p><label htmlFor="reminder-date">Date and time</label><input autoFocus className="popup_box_data" id="reminder-date" type="datetime-local" required value={reminderDate} onChange={event=>setReminderDate(event.target.value)} disabled={organizing}/><div className="popup-buttons"><button type="button" onClick={()=>setReminderNote(null)} disabled={organizing}>Cancel</button><button type="submit" disabled={organizing}>{organizing?'Saving...':'Save reminder'}</button></div></form></div>}
      <ToastContainer />
    </div>
  );
}

export default Home;
