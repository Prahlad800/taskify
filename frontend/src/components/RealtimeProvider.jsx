import {API_BASE_URL} from '../util/api';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {io} from 'socket.io-client';
import axios from 'axios';
import {toast} from 'react-toastify';
const Realtime=createContext({socket:null,status:'offline'});
const baseURL = API_BASE_URL;
export function RealtimeProvider({children}){
 const location=useLocation(),navigate=useNavigate();const token=localStorage.getItem('token');const [socket,setSocket]=useState(null),[status,setStatus]=useState('offline');const seen=useRef(new Set());
 useEffect(()=>{
  if(!token){setSocket(null);setStatus('offline');return;}
  const client=io(baseURL,{autoConnect:false,auth:{token},transports:['websocket','polling'],reconnection:true});
  setSocket(client);setStatus('connecting');
  const interceptor=axios.interceptors.request.use(config=>{if(client.id&&config.url?.startsWith(baseURL))config.headers.set('X-Realtime-Client',client.id);return config;});
  client.on('connect',()=>setStatus('live'));client.on('disconnect',()=>setStatus('reconnecting'));client.on('connect_error',()=>setStatus('reconnecting'));
  client.on('reminder:due',event=>{if(seen.current.has(event.notificationId))return;seen.current.add(event.notificationId);if(seen.current.size>300)seen.current.delete(seen.current.values().next().value);toast.info((event.kind==='task'?'Task reminder: ':'Reminder: ')+event.title,{toastId:event.notificationId,autoClose:false,onClick:()=>navigate(event.kind==='task'?'/task':'/home?view=reminders'),position:'top-right'});});
  client.connect();return()=>{axios.interceptors.request.eject(interceptor);client.disconnect();};
 },[token]);
 return <Realtime.Provider value={{socket,status}}>{children}</Realtime.Provider>;
}
export function useRealtime(){return useContext(Realtime)}
export function useRealtimeEvent(name,callback){const {socket}=useRealtime();const latest=useRef(callback);latest.current=callback;useEffect(()=>{if(!socket)return;const handler=event=>latest.current(event);socket.on(name,handler);return()=>socket.off(name,handler)},[socket,name]);}
export function mergeLiveItem(items,event){if(event.action==='delete')return items.filter(item=>item._id!==event.id);if(!event.item)return items;const current=items.find(item=>item._id===event.id);if(current&&new Date(current.updatedAt)>new Date(event.item.updatedAt))return items;return current?items.map(item=>item._id===event.id?event.item:item):[...items,event.item];}
