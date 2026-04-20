import React, { useEffect, useState } from 'react'
import { useStore, getStoreValue, setStoreValue } from './hooks/useStore'
import Shell from './components/Shell'
import Onboarding from './views/Onboarding'
import TitleBar from './components/TitleBar'
import RiteOfReturnView from './views/RiteOfReturnView'
import OracleView from './views/OracleView'
import { setLocale } from '../engine/i18n'
import { KEYS } from '../data/schema'
import './App.css'

const RETURN_THRESHOLD_DAYS = 14

const LOADING_PHRASES = [
  'The threshold is not a door. It is a crossing.',
  'Nothing is lost. Everything transforms.',
  'The Work begins where comfort ends.',
  'As above, so below. As within, so without.',
  'To know is not enough. To practice is everything.',
]

function LoadingScreen() {
  const phrase = LOADING_PHRASES[Math.floor(Date.now() / 86400000) % LOADING_PHRASES.length]
  return (
    <div className="loading-screen">
      <div className="loading-glyph">⊚</div>
      <div className="loading-name">The Mystery School</div>
      <div className="loading-phrase">{phrase}</div>
    </div>
  )
}

export default function App() {
  const { state, loaded } = useStore()
  const [returnRite, setReturnRite] = useState(null) // null | { daysSince }
  const [showOracle, setShowOracle] = useState(false)

  // Ctrl+O → Oracle
  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.key === 'o' && state?.onboarded) {
        e.preventDefault()
        setShowOracle(s => !s)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state?.onboarded])

  // Apply depth theme to document root
  useEffect(() => {
    if (state?.depthKey) {
      document.documentElement.setAttribute('data-depth', state.depthKey)
    }
  }, [state?.depthKey])

  // Load locale on mount
  useEffect(() => {
    getStoreValue(KEYS.LOCALE).then(loc => { if (loc) setLocale(loc) })
  }, [])

  // Rite of Return: check absence on launch (only for onboarded users)
  useEffect(() => {
    if (!loaded || !state.onboarded) return
    getStoreValue(KEYS.LAST_ACTIVE_DATE).then(lastActive => {
      const today = new Date().toISOString().split('T')[0]
      if (lastActive) {
        const daysSince = Math.floor(
          (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSince >= RETURN_THRESHOLD_DAYS) {
          setReturnRite({ daysSince })
          return
        }
      }
      // Update last active date (no rite needed)
      setStoreValue(KEYS.LAST_ACTIVE_DATE, today)
    })
  }, [loaded, state.onboarded])

  function handleRiteComplete(choice) {
    setStoreValue(KEYS.LAST_ACTIVE_DATE, new Date().toISOString().split('T')[0])
    setReturnRite(null)
  }

  if (!loaded) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A12',
      }}>
        <TitleBar />
        <LoadingScreen />
      </div>
    )
  }

  if (!state.onboarded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar />
        <Onboarding />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Shell />
      </div>
      {returnRite && (
        <RiteOfReturnView
          daysSince={returnRite.daysSince}
          onComplete={handleRiteComplete}
        />
      )}
      {showOracle && state?.onboarded && (
        <OracleView onClose={() => setShowOracle(false)} />
      )}
    </div>
  )
}
