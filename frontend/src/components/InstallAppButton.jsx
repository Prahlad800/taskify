import { useEffect, useState } from 'react'
import './install-app.css'

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)')
    const updateInstalled = () => setInstalled(standalone.matches || window.navigator.standalone === true)
    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    updateInstalled()
    standalone.addEventListener?.('change', updateInstalled)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      standalone.removeEventListener?.('change', updateInstalled)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!installPrompt) {
      setShowHelp(true)
      return
    }
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome !== 'accepted') setInstallPrompt(null)
  }

  return <>
    <button type="button" className="taskify-install-button" onClick={install} hidden={installed} aria-label="Install NotesNexa app">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 16v4h14v-4"/></svg>
      <span>Install app</span>
    </button>
    {showHelp && <div className="taskify-install-overlay" onClick={(event) => { if (event.target === event.currentTarget) setShowHelp(false) }}>
      <section className="taskify-install-dialog" role="dialog" aria-modal="true" aria-labelledby="taskify-install-title">
        <button className="taskify-install-close" type="button" aria-label="Close install instructions" onClick={() => setShowHelp(false)}>×</button>
        <span className="taskify-install-mark" aria-hidden="true">✓</span>
        <h2 id="taskify-install-title">Install NotesNexa</h2>
        <p>In Chrome, open the <strong>⋮ menu</strong> and choose <strong>Install NotesNexa</strong> or <strong>Install page as app</strong>. You can also use the install icon at the right of the address bar when Chrome shows it.</p>
        <button className="taskify-install-dismiss" type="button" onClick={() => setShowHelp(false)}>Got it</button>
      </section>
    </div>}
  </>
}
