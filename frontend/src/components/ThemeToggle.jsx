import {createContext,useContext,useState} from 'react';
const ThemeContext=createContext(null);
export function ThemeProvider({children}){
 const [theme,setTheme]=useState(()=>document.documentElement.dataset.theme || 'light');
 function toggle(){const next=theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;document.documentElement.style.colorScheme=next;try{localStorage.setItem('taskify-theme',next)}catch{}setTheme(next)}
 return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export default function ThemeToggle(){const {theme,toggle}=useContext(ThemeContext);const dark=theme==='dark';return <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'} aria-pressed={dark} title={dark?'Switch to light mode':'Switch to dark mode'}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{!dark?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>:<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>}</svg><span>{dark?'Dark':'Light'}</span></button>}
