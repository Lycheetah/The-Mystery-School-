import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { PHASE_COLOURS } from '../../theme/colours'
import { startAmbient, stopAmbient, setAmbientEnabled, setAmbientVolume } from '../../engine/sound'
import { KEYS } from '../../data/schema'
import SessionCeremony from './SessionCeremony'
import HomeView from '../views/HomeView'
import StudyView from '../views/StudyView'
import PracticeView from '../views/PracticeView'
import JournalView from '../views/JournalView'
import GuideView from '../views/GuideView'
import SpiralView from '../views/SpiralView'
import CouncilView from '../views/CouncilView'
import SettingsView from '../views/SettingsView'
import ThresholdView from '../views/ThresholdView'
import ThresholdsView from '../views/ThresholdsView'
import ForgeView from '../views/ForgeView'
import './Shell.css'

const NAV = [
  { id: 'home',     glyph: '⟟',    label: 'Home' },
  { id: 'study',    glyph: '✧',    label: 'Study' },
  { id: 'practice', glyph: 'Ψ',    label: 'Practice' },
  { id: 'journal',  glyph: '≋',    label: 'Journal' },
  { id: 'guide',    glyph: '⊚',    label: 'Guide' },
  { id: 'council',  glyph: '⊕',    label: 'Council' },
  { id: 'spiral',   glyph: '⟲',    label: 'Journey' },
  { id: 'forge',    glyph: '⊗',    label: 'Forge' },
]

const VIEWS = {
  home:      HomeView,
  study:     StudyView,
  practice:  PracticeView,
  journal:   JournalView,
  guide:     GuideView,
  council:   CouncilView,
  spiral:    SpiralView,
  forge:     ForgeView,
  settings:   SettingsView,
  threshold:  ThresholdView,
  ceremonies: ThresholdsView,
}

// Navigable items for keyboard shortcuts (Alt+1..7 = NAV items, Alt+0=settings)
const NAV_IDS = NAV.map(n => n.id)

export default function Shell() {
  const [active, setActive] = useState('home')
  const [navPayload, setNavPayload] = useState(null)
  const { state } = useStore()
  const navRef = useRef(null)
  const [showCeremony, setShowCeremony] = useState(false)
  const [showClosing, setShowClosing] = useState(false)
  const sessionStartRef = useRef(Date.now())

  // Navigation history
  const historyRef = useRef(['home'])
  const historyIdxRef = useRef(0)
  const canGoBack    = historyIdxRef.current > 0
  const canGoForward = historyIdxRef.current < historyRef.current.length - 1

  function navigate(viewId, payload = null) {
    if (viewId === active) return
    // Truncate forward stack then push
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
    historyRef.current.push(viewId)
    historyIdxRef.current = historyRef.current.length - 1
    setNavPayload(payload)
    setActive(viewId)
  }

  function goBack() {
    if (!canGoBack) return
    historyIdxRef.current -= 1
    const viewId = historyRef.current[historyIdxRef.current]
    setNavPayload(null)
    setActive(viewId)
  }

  function goForward() {
    if (!canGoForward) return
    historyIdxRef.current += 1
    const viewId = historyRef.current[historyIdxRef.current]
    setNavPayload(null)
    setActive(viewId)
  }

  function navigateTo(viewId, payload = null) {
    navigate(viewId, payload)
  }

  // Show opening ceremony once per day
  useEffect(() => {
    getStoreValue(KEYS.SESSION_CEREMONY).then(rec => {
      const today = new Date().toDateString()
      if (!rec || rec.date !== today) {
        setShowCeremony(true)
      }
    })
  }, [])

  function handleCeremonyComplete(intention) {
    const today = new Date().toDateString()
    setStoreValue(KEYS.SESSION_CEREMONY, { date: today, intention })
    setShowCeremony(false)
  }

  // Closing ceremony on window close (via TitleBar custom event)
  useEffect(() => {
    function handleCloseRequest() {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 60000)
      if (elapsed < 1) {
        window.appBridge?.close()
        return
      }
      setShowClosing(true)
      setTimeout(() => window.appBridge?.close(), 3500)
    }
    window.addEventListener('app:close-requested', handleCloseRequest)
    return () => window.removeEventListener('app:close-requested', handleCloseRequest)
  }, [])

  // Load ambient settings from store and start drone on phase
  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.AMBIENT_ENABLED),
      getStoreValue(KEYS.AMBIENT_VOLUME),
    ]).then(([enabled, volume]) => {
      const isEnabled = enabled !== null ? enabled : false
      const vol = volume !== null ? volume : 0.12
      setAmbientEnabled(isEnabled)
      setAmbientVolume(vol)
      if (isEnabled) startAmbient(state.phase || 1)
    })
    return () => stopAmbient()
  }, [])

  // Restart ambient when phase changes
  useEffect(() => {
    startAmbient(state.phase || 1)
  }, [state.phase])

  // IPC navigation from main process
  useEffect(() => {
    if (window.appBridge?.onNavigate) {
      window.appBridge.onNavigate((view) => {
        if (VIEWS[view]) navigate(view)
      })
    }
  }, [])

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Alt+1-7 → nav items, Alt+0 → settings, Alt+T → threshold
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      const digit = parseInt(e.key)
      if (digit >= 1 && digit <= NAV_IDS.length) {
        e.preventDefault()
        navigate(NAV_IDS[digit - 1])
        return
      }
      if (e.key === '0') { e.preventDefault(); navigate('settings'); return }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); navigate('threshold'); return }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); return }
      if (e.key === 'ArrowRight') { e.preventDefault(); goForward(); return }
    }

    // Arrow keys to navigate sidebar when a nav button has focus
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && navRef.current) {
      const buttons = Array.from(navRef.current.querySelectorAll('.nav-item'))
      const focused = buttons.indexOf(document.activeElement)
      if (focused === -1) return
      e.preventDefault()
      const next = e.key === 'ArrowDown'
        ? (focused + 1) % buttons.length
        : (focused - 1 + buttons.length) % buttons.length
      buttons[next].focus()
    }

    // Escape: go home from any sub-view (except home itself)
    if (e.key === 'Escape') {
      if (active !== 'home' && active !== 'threshold') {
        navigate('home')
      }
    }
  }, [active])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const phase = state.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8888CC'
  const phaseGlyph = PHASE_COLOURS[phase]?.glyph || '⟟'
  const phaseName = PHASE_COLOURS[phase]?.name || 'CENTER'
  const depthName = state.depthKey
    ? state.depthKey.charAt(0) + state.depthKey.slice(1).toLowerCase()
    : 'Nigredo'

  const ActiveView = VIEWS[active] || HomeView

  const CLOSING_LINES = {
    1: 'Rest in what was held today.',
    2: 'The movement continues, even in stillness.',
    3: 'What you saw today does not unsee itself.',
    4: 'The work you did today was real.',
    5: 'Carry the clarity gently.',
    6: 'What was released today has been received.',
    7: 'The completion stands.',
  }
  const closingLine = CLOSING_LINES[state.phase || 1]

  return (
    <div className="shell">
      {showCeremony && (
        <SessionCeremony
          phase={state.phase || 1}
          onComplete={handleCeremonyComplete}
        />
      )}

      {showClosing && (
        <div className="closing-ceremony-overlay">
          <div className="closing-ceremony-inner">
            <span className="font-mono" style={{ color: phaseColour, fontSize: 28 }}>{phaseGlyph}</span>
            <p className="font-serif" style={{ fontSize: 18, margin: '16px 0 8px' }}>Session complete.</p>
            <p className="text-dim" style={{ fontSize: 14, fontStyle: 'italic' }}>{closingLine}</p>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="school-mark">
            <span className="school-glyph font-mono">⊚</span>
            <span className="school-name font-serif">The Mystery School</span>
          </div>

          <div className="nav-history-row">
            <button
              className="nav-history-btn"
              onClick={goBack}
              disabled={!canGoBack}
              title="Back (Alt+←)"
              aria-label="Go back"
            >←</button>
            <button
              className="nav-history-btn"
              onClick={goForward}
              disabled={!canGoForward}
              title="Forward (Alt+→)"
              aria-label="Go forward"
            >→</button>
          </div>

          <nav className="nav-list" ref={navRef} aria-label="Main navigation">
            {NAV.map((item, i) => (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? 'nav-item--active' : ''}`}
                onClick={() => navigate(item.id)}
                title={`${item.label} (Alt+${i + 1})`}
                aria-current={active === item.id ? 'page' : undefined}
              >
                <span className="nav-glyph font-mono">{item.glyph}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          {/* Phase coordinates */}
          <div className="phase-coords">
            <span className="phase-glyph font-mono" style={{ color: phaseColour }}>
              {phaseGlyph}
            </span>
            <div className="phase-info">
              <span className="phase-name" style={{ color: phaseColour }}>{phaseName}</span>
              <span className="depth-name text-dim">{depthName}</span>
            </div>
          </div>

          <button
            className="nav-item nav-item--settings"
            onClick={() => navigate('settings')}
            title="Settings (Alt+0)"
          >
            <span className="nav-glyph font-mono">⚙</span>
            <span className="nav-label">Settings</span>
          </button>

          <button
            className="nav-item nav-item--threshold"
            onClick={() => navigate('threshold')}
            title="Crisis support (Alt+T)"
          >
            <span className="nav-glyph font-mono">◎</span>
            <span className="nav-label">Support</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-pane">
        <ActiveView
          onNavigate={setActive}
          onNavigateTo={navigateTo}
          navPayload={active === 'guide' || active === 'council' ? navPayload : null}
          onBack={active === 'threshold' ? () => setActive('home') : undefined}
        />
      </main>
    </div>
  )
}
