import {createContext,useContext,useState} from 'react';
const Panels=createContext(null);
function saved(key){try{return localStorage.getItem(key)==='true'}catch{return false}}
export function PanelToggle({panel,floating=false}){const context=useContext(Panels);if(!context)return null;const hidden=panel==='nav'?context.navHidden:context.listHidden;if(floating!==hidden)return null;const label=(hidden?'Show ':'Hide ')+(panel==='nav'?'navigation':'list');return <button type="button" className={'panel-footer-toggle'+(hidden?' collapsed floating-restore':'')} aria-expanded={!hidden} aria-label={label} title={label} onClick={()=>context.toggle(panel)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1"/>{panel==='nav'?<path d="M9 4v16"/>:<path d="M7 9h10M7 13h10M7 17h10"/>}</svg><span>{label}</span></button>}
export default function WorkspaceLayout({children}){
 const [navHidden,setNavHidden]=useState(()=>saved('taskify-hide-navigation'));
 const [listHidden,setListHidden]=useState(()=>saved('taskify-hide-list'));
 function toggle(panel){const next=!(panel==='nav'?navHidden:listHidden);(panel==='nav'?setNavHidden:setListHidden)(next);try{localStorage.setItem(panel==='nav'?'taskify-hide-navigation':'taskify-hide-list',String(next))}catch{}}
 return <Panels.Provider value={{navHidden,listHidden,toggle}}><div className={'workspace-layout'+(navHidden?' nav-collapsed':'')+(listHidden?' list-collapsed':'')}><div className="contener-note-body">{children}</div><div className="workspace-restore-dock" aria-label="Show workspace panels"><PanelToggle panel="nav" floating/><PanelToggle panel="list" floating/></div></div></Panels.Provider>
}
