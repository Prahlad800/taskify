import {API_BASE_URL} from '../util/api';
import {useRealtimeEvent,mergeLiveItem} from "../components/RealtimeProvider";
import InlineNoteTitle from "../components/InlineNoteTitle";
import {newestUpdatedFirst,formatListDate} from "../util/listDates";
import WorkspaceLayout from "../components/WorkspaceLayout";
import WorkspaceNav from "../components/WorkspaceNav";
import {useNavigate} from "react-router-dom";
import ItemActions from "../components/ItemActions";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import React, { useState, useEffect } from "react";
import Navbar_home from "../components/home/Navbar_home";
import Bottome_home from "../components/home/Bottome_home";
import "../components/home/home.css";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { handleError, handleSuccess } from "../util/error";

function Task() {
  const navigate=useNavigate();
  const [search,setSearch]=useState('');
  const [reminderTask,setReminderTask]=useState(null),[reminderDate,setReminderDate]=useState(''),[reminderSaving,setReminderSaving]=useState(false);
  const navigateView=view=>navigate(view==='tasks'?'/task':view==='notes'?'/home':'/home?view='+view);
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [loggedInName, setLoggedInName] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [showPopupDeleteTask, setShowPopupDeleteTask] = useState(false);

  const [newTodoText, setNewTodoText] = useState("");
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [todosAddTask, setTodosAddTask] = useState([]);

  const [activeTab, setActiveTab] = useState("tasks");
  const [task, setTask] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const baseURL = API_BASE_URL;

  // ðŸ”¥ FETCH ALL TASK
  const fetchNotes = async () => {
    setTaskLoading(true);
    try {
      const res = await axios.get(`${baseURL}/task`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTask(res.data.data);
    } catch (error) {
      handleError("Failed to fetch notes", error);
    } finally {
      setTaskLoading(false);
    }
  };

  // ðŸ”¥ ADD TASK
  const [creating,setCreating]=useState(false);
  const handleSaveTask=async()=>{if(creating)return;setCreating(true);try{const {data}=await axios.post(baseURL+'/task',{},{headers:{Authorization:'Bearer '+getToken()}});setTask(current=>[...current,data.data]);setSearch('');setSelectedTodo(data.data);setTodosAddTask(data.data.task||[]);}catch(error){handleError(error.response?.data?.message||'Could not create task.');}finally{setCreating(false)}};

  const handleTaskClick = async (id) => {
    try {
      const res = await axios.get(`${baseURL}/task/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const todo = res.data.data;
      setSelectedTodo(todo);
      setTodosAddTask(todo.task || []);
    } catch (error) {
      handleError("Failed to load task", error);
    }
  };

  // ðŸ”¥ ADD TODO TO DB
  const addTodoToDB = async () => {
    try {
      const res = await axios.put(
        `${baseURL}/task/${selectedTodo._id}`,
        {
          text: newTodoText,
          completed_todo: false,
          impotent: false,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      setSelectedTodo(res.data.data);
      setTask(current=>current.map(task=>task._id===res.data.data._id?res.data.data:task));
      setTodosAddTask(res.data.data.task);
      setNewTodoText("");
      // const tempTodo = {
      //   // _id: Date.now(), // temporary id
      //   text: newTodoText,
      //   completed_todo: false,
      //   impotent: false,
      // };

      // setTodosAddTask((prev) => [...prev, tempTodo]);
      // setNewTodoText("");

      handleSuccess("Todo added");
    } catch (err) {
      handleError("Error adding todo", err);
    }
  };
  const formatDate = (noteDetails) => {
    // if (!date) return "N/A"; // safety

    return new Date(noteDetails).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  const handleDeletetask = async (id) => {
    try {
      await axios.delete(`${baseURL}/task/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // ðŸ”¥ UI update (task list se remove)
      setTask((prev) => prev.filter((t) => t._id !== id));

      // ðŸ”¥ right side reset
      setSelectedTodo(current=>current?._id===id?null:current);

      handleSuccess("Task deleted");
      return true;
    } catch (err) {
      console.log(err);
      handleError("Delete failed", err);
      return false;
    }
  };

  async function renameItem(id,title,silent=false){const {data}=await axios.patch(baseURL+'/task/'+id+'/title',{title},{headers:{Authorization:'Bearer '+getToken()}});setTask(current=>current.map(item=>item._id===id?{...item,...data.data}:item));setSelectedTodo(current=>current?._id===id?{...current,...data.data}:current);if(!silent)handleSuccess('Title updated');return data.data;}
  useRealtimeEvent('task:changed',event=>{setTask(current=>mergeLiveItem(current,event));if(selectedTodo?._id===event.id){if(event.action==='delete'){setSelectedTodo(null);setTodosAddTask([]);}else if(!document.activeElement?.classList.contains('todo-text')){setSelectedTodo(event.item);setTodosAddTask(event.item.task||[]);}}});
  useRealtimeEvent('realtime:ready',()=>fetchNotes());
  async function updateReminder(id,dueDate){const {data}=await axios.patch(baseURL+'/task/'+id+'/reminder',{dueDate},{headers:{Authorization:'Bearer '+getToken()}});setTask(current=>current.map(item=>item._id===id?data.data:item));setSelectedTodo(current=>current?._id===id?data.data:current);}
  async function saveReminder(event){event.preventDefault();setReminderSaving(true);try{await updateReminder(reminderTask._id,new Date(reminderDate).toISOString());setReminderTask(null);handleSuccess('Task reminder saved');}catch{handleError('Could not save task reminder');}finally{setReminderSaving(false)}}
  function taskActions(item){return [{label:'Set reminder',onClick:()=>{setReminderTask(item);setReminderDate('')}},...(item.dueDate?[{label:'Remove reminder',onClick:()=>updateReminder(item._id,null).catch(()=>handleError('Could not remove reminder'))}]:[])];}

  useEffect(() => {
    setLoggedInUserName(localStorage.getItem("loggedInUserName") || "");
    setLoggedInName(localStorage.getItem("loggedInName") || "");
    fetchNotes();
  }, []);

  return (
    <div className="workspace-app">
      <Navbar_home searchValue={search} onSearchChange={setSearch} searchLabel="Search tasks"
        loggedInUserName={loggedInUserName}
        loggedInName={loggedInName}
      />

      <div className="hello">
        <WorkspaceLayout><WorkspaceNav active="tasks" onNavigate={navigateView}/>
          <WorkspaceSidebar title="Tasks" selectionKey={selectedTodo?._id} navigation={<WorkspaceNav compact active="tasks" onNavigate={navigateView}/>}>{(closeSidebar) => <>
            {/* NAV */}
            <div className="slider-button">
              <Link
                to={"/home"}
                className={`slider-button-signup link ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <span>Notes</span>
              </Link>

              <Link
                to={"/task"}
                className={`slider-button-signup link ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                <span>Tasks</span>
              </Link>
            </div>

            {/* ADD TASK */}
            <div className="slider-add-notes"><button type="button" className="slider-add-notes_btm" onClick={handleSaveTask} disabled={creating}>{creating?'Creating...':'+ New task'}</button></div>

            {/* TASK LIST */}
            <div className="slider-notes-list">
              <div className="collection-heading"><h2>My Tasks ({task.length})</h2></div>
              <div className="line"></div>

              <div className="scrolbar_web">
                {taskLoading ? (
                  <p className="loader">Loading...</p>
                ) : task.length === 0 ? (
                  <p className="slider-note-not">No notes found</p>
                ) : (
                  <ul className="slider-note-ul">
                    {newestUpdatedFirst(task.filter(todo=>todo.title.toLowerCase().includes(search.toLowerCase()))).map((todo) => (
                      <li
                        key={todo._id}
                        className={`slider-note-ls ${
                          todo.priority === "low"
                            ? "priority-low"
                            : todo.priority === "medium"
                              ? "priority-medium"
                              : "priority-high"
                        }`}
                        onClick={() => {handleTaskClick(todo._id); closeSidebar();}}
                      >
                        <button type="button" className="note-open-button"><strong>{todo.title}</strong><span className="note-card-excerpt">{todo.priority} priority</span><time className="note-card-time" dateTime={todo.updatedAt||todo.createdAt}>Updated: {formatListDate(todo.updatedAt||todo.createdAt)}</time>{todo.dueDate&&<span className="note-card-time">Reminder: {formatListDate(todo.dueDate)}</span>}</button>
                        <ItemActions actions={taskActions(todo)} title={todo.title} onRename={title=>renameItem(todo._id,title)} onDelete={()=>handleDeletetask(todo._id)}/>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>}</WorkspaceSidebar>

          {/* RIGHT SIDE */}
          <div className="contener-note-content">
            <div className="content_task">
              {selectedTodo ? (
                <div className="task-content-wrapper">
                  <div className="show_time_main">
                    <div className="show_time">
                      <InlineNoteTitle key={selectedTodo._id} title={selectedTodo.title} onSave={title=>renameItem(selectedTodo._id,title,true)}/>
                      <h2>Priority : {selectedTodo.priority}</h2>

                      <button
                        className="delete_notes"
                        onClick={() => setShowPopupDeleteTask(true)}
                      >
                        Delete
                      </button>
                    </div>
                    {showPopupDeleteTask && (
                      <div className="popup-overlay">
                        <div className="popup-box">
                          <h3 className="delete_note_text">
                            Are you sure you want to delete this task?
                          </h3>

                          <div className="popup-buttons">
                            <button
                              onClick={() => setShowPopupDeleteTask(false)}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await handleDeletetask(selectedTodo._id);
                                setShowPopupDeleteTask(false);
                              }}
                            >
                              Delete Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="show_time">
                      <p>
                        Created At:
                        {formatDate(selectedTodo.createdAt)}
                      </p>

                      <p>
                        Updated At:
                        {formatDate(selectedTodo.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="line"></div>

                  {/* ADD TODO */}
                  <div className="todo-input-wrapper">
                    <input
                      type="text"
                      className="todo-input"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="Write task..."
                    />

                    <button
                      className="add-btn todo-add-btn"
                      onClick={addTodoToDB}
                    >
                      + Add Todo
                    </button>
                  </div>

                  <div className="line"></div>

                  {/* TODO LIST */}
                  <div className="todo-list-wrapper">
                    {todosAddTask.map((item) => (
                      <div
                        key={item._id}
                        className={`todo-item todo-row ${item.impotent ? "important" : ""}`}
                      >
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={item.completed_todo}
                          onChange={async () => {
                            try {
                              const updated = todosAddTask.map((t) =>
                                t._id === item._id
                                  ? { ...t, completed_todo: !t.completed_todo }
                                  : t,
                              );
                              setTodosAddTask(updated);
                              const res = await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { completed_todo: !item.completed_todo },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );

                              setSelectedTodo(res.data.data);
      setTask(current=>current.map(task=>task._id===res.data.data._id?res.data.data:task));
                              setTodosAddTask(res.data.data.task);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                        />

                        {/* TEXT */}
                        <input
                          type="text"
                          className={`todo-text ${item.completed_todo ? "completed" : ""}`}
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...todosAddTask];
                            updated.find((t) => t._id === item._id).text =
                              e.target.value;
                            setTodosAddTask(updated);
                          }}
                          onBlur={async () => {
                            try {
                              const res = await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { text: item.text },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );
                              setTask(current=>current.map(task=>task._id===res.data.data._id?res.data.data:task));
                              setSelectedTodo(res.data.data);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          placeholder="Write task..."
                        />
                        <div className="todo-date">
                          created time {formatDate(item?.createdAt)}
                        </div>

                        {item.completed_todo && item.completedAt && (
                          <div className="todo-date completed-time">
                            completed time {formatDate(item.completedAt)}
                          </div>
                        )}
                        {/* STAR */}
                        <button
                          className="star-btn todo-star-btn"
                          onClick={async () => {
                            try {
                              const res = await axios.put(
                                `${baseURL}/task/${selectedTodo._id}/${item._id}`,
                                { impotent: !item.impotent },
                                {
                                  headers: {
                                    Authorization: `Bearer ${getToken()}`,
                                  },
                                },
                              );

                              setSelectedTodo(res.data.data);
      setTask(current=>current.map(task=>task._id===res.data.data._id?res.data.data:task));
                              setTodosAddTask(res.data.data.task);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                        >
                          {item.impotent ? "â­" : "â˜†"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-task-text">Ready when you are. Select a task or create your first one.</p>
              )}
            </div>
          </div>
        </WorkspaceLayout>
      </div>

      <Bottome_home />
      {reminderTask&&<div className="popup-overlay"><form className="popup-box" role="dialog" aria-modal="true" aria-label="Set task reminder" onSubmit={saveReminder}><h3>Task reminder</h3><p>{reminderTask.title}</p><label htmlFor="task-reminder-date">Date and time</label><input autoFocus className="popup_box_data" id="task-reminder-date" type="datetime-local" required value={reminderDate} onChange={event=>setReminderDate(event.target.value)} disabled={reminderSaving}/><div className="popup-buttons"><button type="button" onClick={()=>setReminderTask(null)} disabled={reminderSaving}>Cancel</button><button type="submit" disabled={reminderSaving}>{reminderSaving?'Saving...':'Save reminder'}</button></div></form></div>}<ToastContainer />
    </div>
  );
}

export default Task;
