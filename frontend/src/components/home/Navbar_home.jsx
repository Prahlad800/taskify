import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '../RealtimeProvider'
import ThemeToggle from '../ThemeToggle'
import Icon from '../WorkspaceIcon'
import InstallAppButton from '../InstallAppButton'
import './navbar_home.css'

export default function NavbarHome({
  loggedInName,
  loggedInUserName,
  onHome,
  onReminders,
  reminderCount = 0,
  searchValue = '',
  onSearchChange,
  searchLabel = 'Search notes',
}) {
  const displayName = (loggedInName || loggedInUserName || 'Guest').trim()
  const avatarInitial = displayName.charAt(0).toUpperCase() || 'U'
  const { status } = useRealtime()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const account = useRef(null)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning,' : hour < 17 ? 'Good Afternoon,' : 'Good Evening,'

  useEffect(() => {
    if (!open) return undefined
    const click = (event) => {
      if (!account.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', click)
    return () => document.removeEventListener('pointerdown', click)
  }, [open])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUserName')
    localStorage.removeItem('loggedInName')
    navigate('/login')
  }

  return <header className="contener-main workspace-topnav">
    <button className="contener-img brand" aria-label="NotesNexa home" onClick={() => onHome ? onHome() : navigate('/home')}>
      <img className="notesnexa-brand-icon" src="/notesnexa-192x192.png" alt="NotesNexa" />
    </button>
    <div className="contener-user"><span className="greating">{greeting}</span><strong className="user">{loggedInName || 'Welcome'}</strong></div>
    <div className="header-search" role="search">
      <Icon name="search" size={18} />
      <input type="search" aria-label={searchLabel} placeholder={`${searchLabel}...`} value={searchValue} onChange={(event) => onSearchChange?.(event.target.value)} />
      {searchValue && <button type="button" aria-label="Clear search" onClick={() => onSearchChange?.('')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>}
    </div>
    <div className="contener-name">
      <span className={`realtime-indicator ${status}`} title={status === 'live' ? 'Live updates connected' : 'Reconnecting live updates'} aria-label={status === 'live' ? 'Live updates connected' : 'Live updates reconnecting'}><i />{status === 'live' ? 'Live' : 'Connecting'}</span>
      <ThemeToggle />
      <InstallAppButton />
      <button type="button" className="notification-button" aria-label={reminderCount ? `${reminderCount} note reminders` : 'Open reminders'} onClick={() => onReminders ? onReminders() : navigate('/home?view=reminders')}><Icon name="reminders" size={24} />{reminderCount > 0 && <span className="notification-dot" />}</button>
      <span className="name">{displayName}</span>
      <div className="account-anchor" ref={account}>
        <button className="profile" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}>{avatarInitial}</button>
        {open && <div className="profile-box"><span>{loggedInName}</span><button onClick={logout} className="logout-btn">Sign out</button></div>}
      </div>
    </div>
  </header>
}
