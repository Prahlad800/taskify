import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './landing.css'

const features = [
  { icon: '✎', title: 'Notes', text: 'Write quick notes, ideas and reminders. Keep everything organized and easy to find.' },
  { icon: '✓', title: 'Tasks', text: 'Add to-dos, mark them complete and never lose track of what needs to be done.' },
  { icon: '↗', title: 'Progress', text: 'See how much you have finished at a glance and stay motivated every day.' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [tasks, setTasks] = useState([])
  const doneCount = useMemo(() => tasks.filter(task => task.done).length, [tasks])
  const progress = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0

  function addTask(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTasks(current => [...current, { id: Date.now(), text, done: false }])
    setDraft('')
  }

  function toggleTask(id) {
    setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task))
  }

  function removeTask(id) {
    setTasks(current => current.filter(task => task.id !== id))
  }

  return <div className="landing-page">
    <header className="landing-header">
      <div className="landing-container landing-nav">
        <Link to="/" className="landing-logo" aria-label="NotesNexa home"><img src="/favicon-32x32.png" alt="" />Notes<span>Nexa</span></Link>
        <nav className={`landing-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#demo" onClick={() => setMenuOpen(false)}>Try it</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </nav>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link className="landing-button landing-outline" to="/login">Login</Link>
          <button className="landing-menu-button" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? '×' : '☰'}</button>
        </div>
      </div>
    </header>

    <main>
      <section className="landing-hero">
        <div className="landing-container">
          <span className="landing-badge">Your daily space</span>
          <h1>Organize your notes, tasks<br className="landing-break" /> and <span>daily progress</span> in one place</h1>
          <p>NotesNexa keeps your notes, tasks, and everyday progress in one clear space, so you can focus on what matters.</p>
          <div className="landing-hero-actions">
            <a href="#demo" className="landing-button landing-primary">Try the demo</a>
            <Link to="/login" className="landing-button landing-outline">Login to your account</Link>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="landing-section-title"><h2>Everything you need, nothing you don't</h2><p>Simple tools to keep your day under control.</p></div>
          <div className="landing-feature-grid">{features.map(feature => <article className="landing-feature-card" key={feature.title}><span className="landing-feature-icon" aria-hidden="true">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
        </div>
      </section>

      <section className="landing-section landing-demo-section" id="demo">
        <div className="landing-container">
          <div className="landing-section-title"><h2>Try it right now</h2><p>Add a few tasks and tick them off to see your progress.</p></div>
          <div className="landing-demo-card">
            <form className="landing-demo-form" onSubmit={addTask}>
              <input aria-label="New demo task" type="text" maxLength={120} placeholder="What do you need to do today?" value={draft} onChange={event => setDraft(event.target.value)} />
              <button className="landing-button landing-primary" type="submit">Add</button>
            </form>
            <ul className="landing-task-list">
              {tasks.length === 0 ? <li className="landing-empty">No tasks yet. Add your first one!</li> : tasks.map(task => <li className={task.done ? 'is-done' : ''} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} aria-label={`Complete ${task.text}`} /><span>{task.text}</span><button type="button" className="landing-remove" aria-label={`Delete ${task.text}`} onClick={() => removeTask(task.id)}>×</button></li>)}
            </ul>
            <div className="landing-progress"><div className="landing-progress-track"><span style={{ width: `${progress}%` }} /></div><p>{doneCount} of {tasks.length} completed ({progress}%)</p></div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="about"><div className="landing-container landing-section-title landing-about"><h2>About NotesNexa</h2><p>NotesNexa is built to make your daily routine simpler. One space for your notes, your tasks and your progress, with no clutter and no distractions.</p></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-container">© {new Date().getFullYear()} NotesNexa. All rights reserved.</div></footer>
  </div>
}
