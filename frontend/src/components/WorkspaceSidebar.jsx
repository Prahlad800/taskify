import {PanelToggle} from "./WorkspaceLayout";
import {useEffect,useRef,useState} from 'react';

export default function WorkspaceSidebar({children,title,navigation,selectionKey}){
 const [open,setOpen]=useState(false);
 const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 640px)').matches);
 const trigger=useRef(null),panel=useRef(null);
 useEffect(()=>{setOpen(false)},[selectionKey]);
 const close=()=>setOpen(false);
 useEffect(()=>{const query=window.matchMedia('(max-width: 640px)');const change=()=>{setMobile(query.matches);setOpen(false)};query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
 useEffect(()=>{
  if(!open||!mobile)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  panel.current?.querySelector('button')?.focus();
  const keydown=event=>{
   if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
   if(event.key!=='Tab')return;
   const elements=[...panel.current.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(node=>node.getClientRects().length);
   const first=elements[0],last=elements.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  };
  document.addEventListener('keydown',keydown);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',keydown);trigger.current?.focus()};
 },[open,mobile]);
 return <><div className="mobile-workspace-toolbar"><button ref={trigger} type="button" className="workspace-menu-button" aria-expanded={open} aria-controls="workspace-sidebar" onClick={()=>setOpen(true)}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Notes & tasks</span></button><span className="mobile-workspace-label">{title}</span></div>
 {mobile&&open&&<div className="workspace-drawer-backdrop" onClick={close} aria-hidden="true"/>}
 <aside ref={panel} id="workspace-sidebar" className={'contener-note-slider workspace-sidebar'+(open?' drawer-open':'')} role={mobile&&open?'dialog':undefined} aria-modal={mobile&&open?true:undefined} aria-label="Notes and tasks navigation">
 <div className="drawer-heading"><span>Your workspace</span><button type="button" className="drawer-close" onClick={close} aria-label="Close workspace menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>
 {navigation&&<div className="drawer-navigation">{navigation}</div>}
 {children(close)}
 <PanelToggle panel="list"/>
 </aside></>;
}
