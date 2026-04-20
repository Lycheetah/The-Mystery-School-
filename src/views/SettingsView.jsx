import React, { useState, useEffect } from 'react'
import { useStore, clearStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import CovenantView from './CovenantView'
import { DOORS } from '../../engine/doors'
import { DEPTHS } from '../../theme/colours'
import { PROVIDERS } from '../../engine/api'
import { setAmbientEnabled, setAmbientVolume, getAmbientEnabled, getAmbientVolume, startAmbient } from '../../engine/sound'
import { SUPPORTED_LOCALES, setLocale } from '../../engine/i18n'
import { KEYS } from '../../data/schema'
import { checkSovereignCode, SOVEREIGN_PERKS } from '../../data/sovereign'
import './SettingsView.css'

const AGE_MODES = [
  { id: 'adult', label: 'Adult (18+)', desc: 'Full curriculum. All content accessible.' },
  { id: 'teen',  label: 'Teen (13–17)', desc: 'Guide uses plain language. Void Room deferred.' },
  { id: 'child', label: 'Child (6–12)', desc: 'Simple language. Parental mode enabled automatically.' },
]

export default function SettingsView() {
  const { state, update } = useStore()
  const [apiKeys, setApiKeys] = useState({})
  const [saved, setSaved] = useState({})
  const [ambientOn, setAmbientOn] = useState(false)
  const [ambientVol, setAmbientVol] = useState(0.12)
  const [showCovenant, setShowCovenant] = useState(false)
  const [covenantData, setCovenantData] = useState(null)
  const [doorRitual, setDoorRitual] = useState(null) // { fromDoor, toDoor }
  const [doorIntention, setDoorIntention] = useState('')
  const [ritualStep, setRitualStep] = useState('confirm') // 'confirm' | 'intention' | 'crossed'
  const [breathCount, setBreathCount] = useState(0)
  const [breathPhase, setBreathPhase] = useState('Inhale')
  const [crossings, setCrossings] = useState([])
  const [ageMode, setAgeModeState] = useState('adult')
  const [parentalMode, setParentalModeState] = useState(false)
  const [locale, setLocaleState] = useState('en')
  const [sovereign, setSovereignState] = useState(null)
  const [sovereignCode, setSovereignCode] = useState('')
  const [sovereignError, setSovereignError] = useState('')
  const [personalGlyph, setPersonalGlyph] = useState('')
  const [skyEnabled, setSkyEnabledState] = useState(true)
  const [hemisphere, setHemisphereState] = useState('n')

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.DOOR_CROSSINGS),
      getStoreValue(KEYS.AGE_MODE),
      getStoreValue(KEYS.PARENTAL_MODE),
      getStoreValue(KEYS.LOCALE),
      getStoreValue(KEYS.SOVEREIGN_TIER),
      getStoreValue(KEYS.COVENANT),
    ]).then(async ([c, age, parental, loc, sov, cov]) => {
      setCrossings(c || [])
      setAgeModeState(age || 'adult')
      setParentalModeState(parental || false)
      setLocaleState(loc || 'en')
      setSovereignState(sov || null)
      setPersonalGlyph(sov?.personalGlyph || '')
      setCovenantData(cov || null)
      const [skyEn, hemi] = await Promise.all([
        getStoreValue(KEYS.SKY_ENABLED),
        getStoreValue(KEYS.HEMISPHERE),
      ])
      setSkyEnabledState(skyEn !== false)
      setHemisphereState(hemi || 'n')
    })
  }, [])

  useEffect(() => {
    const providers = Object.values(PROVIDERS)
    Promise.all([
      ...providers.map(p => getStoreValue(p.settingsKey).then(k => [p.id, k || ''])),
      getStoreValue(KEYS.AMBIENT_ENABLED),
      getStoreValue(KEYS.AMBIENT_VOLUME),
    ]).then(results => {
      const providerPairs = results.slice(0, providers.length)
      const [enabled, volume] = results.slice(providers.length)
      setApiKeys(Object.fromEntries(providerPairs))
      setAmbientOn(enabled !== null ? enabled : false)
      setAmbientVol(volume !== null ? volume : 0.12)
    })
  }, [])

  async function toggleAmbient(val) {
    setAmbientOn(val)
    setAmbientEnabled(val)
    await setStoreValue(KEYS.AMBIENT_ENABLED, val)
    if (val) startAmbient(state?.coordinates?.phase || state?.phase || 1)
  }

  async function changeVolume(vol) {
    const v = parseFloat(vol)
    setAmbientVol(v)
    setAmbientVolume(v)
    await setStoreValue(KEYS.AMBIENT_VOLUME, v)
  }

  async function changeAgeMode(mode) {
    setAgeModeState(mode)
    await setStoreValue(KEYS.AGE_MODE, mode)
    if (mode === 'child') {
      setParentalModeState(true)
      await setStoreValue(KEYS.PARENTAL_MODE, true)
    }
  }

  async function toggleParentalMode(val) {
    setParentalModeState(val)
    await setStoreValue(KEYS.PARENTAL_MODE, val)
  }

  async function changeLocale(code) {
    setLocaleState(code)
    setLocale(code)
    await setStoreValue(KEYS.LOCALE, code)
  }

  async function unlockSovereign() {
    if (!checkSovereignCode(sovereignCode)) {
      setSovereignError('Invalid code.')
      return
    }
    const sov = { unlocked: true, unlockedAt: new Date().toISOString(), personalGlyph: '' }
    setSovereignState(sov)
    setSovereignError('')
    setSovereignCode('')
    await setStoreValue(KEYS.SOVEREIGN_TIER, sov)
  }

  async function savePersonalGlyph(glyph) {
    const trimmed = glyph.trim().slice(0, 3)
    setPersonalGlyph(trimmed)
    const sov = { ...(sovereign || {}), personalGlyph: trimmed }
    setSovereignState(sov)
    await setStoreValue(KEYS.SOVEREIGN_TIER, sov)
  }

  async function exportData() {
    // Collect all user data keys
    const dataKeys = [
      KEYS.USER_STATE, KEYS.ASSESSMENT, KEYS.PROGRESS, KEYS.PRACTICE_LOG,
      KEYS.JOURNAL, KEYS.STREAKS, KEYS.WISDOM_SEEN, KEYS.WISDOM_TODAY,
      KEYS.UNLOCKED_ROOM, KEYS.VOID_ROOM, KEYS.TAROT_HISTORY, KEYS.WEEKLY_PULSE,
    ]
    const pairs = await Promise.all(dataKeys.map(k => getStoreValue(k).then(v => [k, v])))
    const data = Object.fromEntries(pairs.filter(([, v]) => v !== null))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mystery-school-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file) {
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      // Validate it looks like our data
      if (typeof data !== 'object' || !data[KEYS.USER_STATE]) {
        alert('Invalid backup file — missing user state.')
        return
      }
      if (!window.confirm('Import this backup? This will replace all current data.')) return
      await Promise.all(
        Object.entries(data).map(([k, v]) => setStoreValue(k, v))
      )
      window.location.reload()
    } catch (e) {
      alert('Failed to import: ' + e.message)
    }
  }

  async function saveKey(providerId, key) {
    const provider = PROVIDERS[providerId]
    await setStoreValue(provider.settingsKey, key.trim())
    setSaved(s => ({ ...s, [providerId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [providerId]: false })), 2000)
  }

  async function handleClearData() {
    if (window.confirm('Clear all data and restart onboarding?')) {
      await clearStore()
      window.location.reload()
    }
  }

  function openDoorRitual(doorKey) {
    if (doorKey === state.door) return
    setDoorRitual({ fromDoor: state.door, toDoor: doorKey })
    setDoorIntention('')
    setRitualStep('confirm')
  }

  async function completeDoorCrossing() {
    const toDoor = doorRitual.toDoor
    const fromDoor = doorRitual.fromDoor
    const crossing = {
      fromDoor,
      toDoor,
      intention: doorIntention.trim(),
      crossedAt: new Date().toISOString(),
    }
    const updated = [crossing, ...crossings]
    setCrossings(updated)
    await setStoreValue(KEYS.DOOR_CROSSINGS, updated)
    update({ door: toDoor })
    setRitualStep('crossed')
    setTimeout(() => setDoorRitual(null), 3000)
  }

  const fromDoorData = doorRitual ? DOORS[doorRitual.fromDoor] : null
  const toDoorData   = doorRitual ? DOORS[doorRitual.toDoor]   : null

  return (
    <div className="settings-view">
      <h1 className="font-serif settings-title">Settings</h1>

      {/* Door transition ritual modal */}
      {doorRitual && (
        <div className="ritual-overlay">
          <div className="ritual-modal">
            {ritualStep === 'confirm' && (
              <>
                <div className="ritual-glyph font-mono">
                  {fromDoorData?.glyph} → {toDoorData?.glyph}
                </div>
                <h3 className="ritual-title font-serif">You are crossing a threshold.</h3>
                <p className="ritual-desc text-dim">
                  From <strong>{fromDoorData?.name}</strong> to <strong>{toDoorData?.name}</strong>.<br />
                  {toDoorData?.hook}
                </p>
                <p className="ritual-desc text-dim" style={{ fontSize: 13 }}>
                  This crossing will be recorded permanently in your Journey.
                </p>
                <div className="ritual-btns">
                  <button className="ritual-cancel" onClick={() => setDoorRitual(null)}>Not yet</button>
                  <button className="ritual-proceed" onClick={() => setRitualStep('intention')}>
                    I am ready
                  </button>
                </div>
              </>
            )}

            {ritualStep === 'intention' && (
              <>
                <div className="ritual-glyph font-mono">{toDoorData?.glyph}</div>
                <h3 className="ritual-title font-serif">Set your intention.</h3>
                <p className="ritual-desc text-dim">
                  Why are you crossing to {toDoorData?.name}?<br />
                  What are you bringing? What are you leaving behind?
                </p>
                <textarea
                  className="ritual-intention"
                  placeholder="Write your intention (optional)…"
                  value={doorIntention}
                  onChange={e => setDoorIntention(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="ritual-btns">
                  <button className="ritual-cancel" onClick={() => setDoorRitual(null)}>Cancel</button>
                  <button className="ritual-proceed" onClick={completeDoorCrossing}>
                    Cross the threshold
                  </button>
                </div>
              </>
            )}

            {ritualStep === 'crossed' && (
              <>
                <div className="ritual-glyph font-mono" style={{ fontSize: 40 }}>{toDoorData?.glyph}</div>
                <h3 className="ritual-title font-serif">The crossing is made.</h3>
                <p className="ritual-desc text-dim">
                  You have entered {toDoorData?.name}.<br />
                  This is recorded in your Journey.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* API Keys */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">API Keys</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
          Keys are stored locally on your machine only. Never sent to any server except the provider directly.
        </p>
        <div className="api-key-list">
          {Object.values(PROVIDERS).map(p => (
            <div key={p.id} className="api-key-row">
              <div className="api-key-info">
                <span className="font-mono" style={{ color: p.colour }}>{p.glyph}</span>
                <div>
                  <div className="api-key-name">{p.name}</div>
                  <div className="api-key-hint text-dim">{p.hint}</div>
                </div>
              </div>
              <div className="api-key-input-row">
                <input
                  type="password"
                  className="api-key-input"
                  placeholder={`${p.name} API key…`}
                  value={apiKeys[p.id] || ''}
                  onChange={e => setApiKeys(k => ({ ...k, [p.id]: e.target.value }))}
                  onBlur={e => saveKey(p.id, e.target.value)}
                />
                {saved[p.id] && <span className="api-key-saved">✓ Saved</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Door switcher */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Your Door</h3>
        <div className="door-grid">
          {Object.values(DOORS).map(door => (
            <button
              key={door.key}
              className={`door-chip ${state.door === door.key ? 'door-chip--active' : ''}`}
              onClick={() => openDoorRitual(door.key)}
            >
              <span className="font-mono">{door.glyph}</span>
              <span>{door.name}</span>
            </button>
          ))}
        </div>
        {crossings.length > 0 && (
          <div className="door-crossings">
            <div className="text-dim" style={{ fontSize: 12, marginBottom: 8 }}>Crossings recorded:</div>
            {crossings.slice(0, 3).map((c, i) => {
              const from = DOORS[c.fromDoor]
              const to = DOORS[c.toDoor]
              return (
                <div key={i} className="door-crossing-record text-dim">
                  <span className="font-mono">{from?.glyph || '?'}</span>
                  <span> → </span>
                  <span className="font-mono">{to?.glyph || '?'}</span>
                  <span> {to?.name}</span>
                  <span style={{ marginLeft: 8, fontSize: 11 }}>{new Date(c.crossedAt).toLocaleDateString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Depth theme */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Depth Theme</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 12 }}>
          Your theme is set automatically by your assessment depth. Override it here.
        </p>
        <div className="depth-theme-grid">
          {Object.entries(DEPTHS)
            .filter(([, depth]) => !depth.sovereign || sovereign?.unlocked)
            .map(([key, depth]) => (
            <button
              key={key}
              className={`depth-theme-card ${state.depthKey === key ? 'depth-theme-card--active' : ''} ${depth.sovereign ? 'depth-theme-card--sovereign' : ''}`}
              style={state.depthKey === key ? { borderColor: depth.accent } : {}}
              onClick={() => update({ depthKey: key })}
            >
              <div className="depth-theme-swatch" style={{ background: depth.bg, border: `2px solid ${depth.accent}` }}>
                <span style={{ color: depth.glyph, fontSize: 16 }}>{depth.symbol}</span>
              </div>
              <div>
                <div className="depth-theme-name" style={state.depthKey === key ? { color: depth.accent } : {}}>
                  {depth.name}
                </div>
                {depth.sovereign && <div className="depth-theme-sovereign-tag">⟁</div>}
              </div>
            </button>
          ))}
        </div>
        {!sovereign?.unlocked && (
          <p className="text-dim" style={{ fontSize: 12, marginTop: 8 }}>
            ⟁ Two additional themes (Sol, Eclipse) unlock with Sovereign Tier.
          </p>
        )}
      </section>

      {/* Language */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Language</h3>
        <div className="age-mode-grid">
          {SUPPORTED_LOCALES.map(l => (
            <button
              key={l.code}
              className={`age-mode-chip ${locale === l.code ? 'age-mode-chip--active' : ''}`}
              onClick={() => changeLocale(l.code)}
            >
              {l.name}
            </button>
          ))}
        </div>
        <p className="text-dim" style={{ fontSize: 12, marginTop: 10 }}>
          Translations are partial — not all text is translated yet. More languages coming.
        </p>
      </section>

      {/* Age Mode */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Age Mode</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 14 }}>
          Adjusts the Guide's language register and content access.
        </p>
        <div className="age-mode-list">
          {AGE_MODES.map(m => (
            <button
              key={m.id}
              className={`age-mode-row ${ageMode === m.id ? 'age-mode-row--active' : ''}`}
              onClick={() => changeAgeMode(m.id)}
            >
              <div className="age-mode-row-left">
                <span className="age-mode-label">{m.label}</span>
                <span className="age-mode-desc text-dim">{m.desc}</span>
              </div>
              {ageMode === m.id && <span className="age-mode-check font-mono">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Parental Mode */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Parental Mode</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 14 }}>
          Restricts Void Room content and intense shadow work prompts. Automatically enabled for Child mode.
        </p>
        <div className="sound-toggle-row">
          <span style={{ fontSize: 14 }}>Parental mode {parentalMode ? 'on' : 'off'}</span>
          <button
            className={`sound-toggle-btn ${parentalMode ? 'sound-toggle-btn--on' : ''}`}
            onClick={() => toggleParentalMode(!parentalMode)}
          >
            {parentalMode ? 'On' : 'Off'}
          </button>
        </div>
      </section>

      {/* Sound */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Sound</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
          Ambient drones synthesized in real-time from your current phase. No audio files.
        </p>
        <div className="sound-toggle-row">
          <span style={{ fontSize: 14 }}>Phase ambient drone</span>
          <button
            className={`sound-toggle-btn ${ambientOn ? 'sound-toggle-btn--on' : ''}`}
            onClick={() => toggleAmbient(!ambientOn)}
          >
            {ambientOn ? 'On' : 'Off'}
          </button>
        </div>
        {ambientOn && (
          <div className="sound-volume-row">
            <span className="text-dim" style={{ fontSize: 13 }}>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVol}
              onChange={e => changeVolume(e.target.value)}
              className="sound-volume-slider"
            />
            <span className="text-dim font-mono" style={{ fontSize: 12, minWidth: 36 }}>
              {Math.round(ambientVol * 100)}%
            </span>
          </div>
        )}
      </section>

      {/* Sky / Cosmos */}
      <section className="settings-section">
        <h3 className="settings-section-title">Sky & Cosmos</h3>
        <p className="settings-section-desc text-dim">
          Let the actual sky affect the app — moon phase tint, retrograde awareness, seasonal thresholds.
        </p>
        <div className="sound-toggle-row">
          <span style={{ fontSize: 14 }}>Sky affects app</span>
          <button
            className={`sound-toggle-btn ${skyEnabled ? 'sound-toggle-btn--on' : ''}`}
            onClick={async () => {
              const next = !skyEnabled
              setSkyEnabledState(next)
              await setStoreValue(KEYS.SKY_ENABLED, next)
            }}
          >
            {skyEnabled ? 'On' : 'Off'}
          </button>
        </div>
        {skyEnabled && (
          <div className="sound-toggle-row" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: 14 }}>Hemisphere</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[{ id: 'n', label: 'Northern' }, { id: 's', label: 'Southern' }].map(h => (
                <button
                  key={h.id}
                  className={`meditation-dur-btn ${hemisphere === h.id ? 'meditation-dur-btn--active' : ''}`}
                  onClick={async () => {
                    setHemisphereState(h.id)
                    await setStoreValue(KEYS.HEMISPHERE, h.id)
                  }}
                >{h.label}</button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Covenant */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Your Covenant</h3>
        {covenantData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20, color: 'var(--accent)' }}>{covenantData.glyph}</span>
              <span className="text-dim" style={{ fontSize: 12 }}>
                Sealed {new Date(covenantData.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-dim" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
              {covenantData.text.slice(0, 160)}{covenantData.text.length > 160 ? '…' : ''}
            </p>
          </>
        ) : (
          <p className="text-dim" style={{ fontSize: 13, marginBottom: 12 }}>
            You have not yet written your covenant. The covenant binds you to your own stated purpose.
          </p>
        )}
        <button className="btn-primary" onClick={() => setShowCovenant(true)}>
          {covenantData ? 'Revisit Covenant' : 'Write Covenant'}
        </button>
      </section>

      {/* Re-assess */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Assessment</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 12 }}>
          Retake the WHERE_AM_I assessment to update your phase coordinates.
          Quick re-assess skips welcome and door selection — goes straight to the 35 questions.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={() => update({ onboarded: false, quickReassess: true })}
          >
            Quick Re-assess
          </button>
          <button
            className="btn-ghost"
            onClick={() => update({ onboarded: false, quickReassess: false })}
          >
            Full Re-assess
          </button>
        </div>
      </section>

      {/* Data backup */}
      <section className="settings-section card">
        <h3 className="settings-heading text-dim">Data Backup</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 12 }}>
          Export all progress, journal entries, and settings to a JSON file. Import to restore on the same or a new machine.
        </p>
        <div className="data-backup-row">
          <button className="btn-ghost" onClick={exportData}>
            Export Backup
          </button>
          <label className="btn-ghost data-import-label">
            Import Backup
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => importData(e.target.files?.[0])}
            />
          </label>
        </div>
      </section>

      {/* Guide memory — insight manager */}
      <InsightManager />

      {/* Sovereign Tier */}
      <section className="settings-section card sovereign-section">
        <h3 className="settings-heading sovereign-heading">
          ⟁ Sovereign Tier
          {sovereign?.unlocked && <span className="sovereign-badge">Unlocked</span>}
        </h3>

        {sovereign?.unlocked ? (
          <>
            <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
              The school recognises your sovereignty. All perks are active.
            </p>
            <div className="sovereign-perks">
              {SOVEREIGN_PERKS.map(p => (
                <div key={p.id} className="sovereign-perk">
                  <span className="sovereign-perk-glyph font-mono">{p.glyph}</span>
                  <div>
                    <div className="sovereign-perk-label">{p.label}</div>
                    <div className="sovereign-perk-desc text-dim">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <div className="text-dim" style={{ fontSize: 12, marginBottom: 8 }}>Personal Glyph (1–3 characters)</div>
              <div className="sovereign-glyph-row">
                <input
                  className="sovereign-glyph-input font-mono"
                  value={personalGlyph}
                  onChange={e => setPersonalGlyph(e.target.value.slice(0, 3))}
                  onBlur={e => savePersonalGlyph(e.target.value)}
                  placeholder="⟁"
                  maxLength={3}
                />
                {personalGlyph && (
                  <span className="sovereign-glyph-preview font-mono">{personalGlyph}</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
              One-time unlock. The school never paywalls knowledge — sovereign perks are cosmetic and comfort.
            </p>
            <div className="sovereign-perks sovereign-perks--preview">
              {SOVEREIGN_PERKS.map(p => (
                <div key={p.id} className="sovereign-perk sovereign-perk--locked">
                  <span className="sovereign-perk-glyph font-mono text-dim">{p.glyph}</span>
                  <div>
                    <div className="sovereign-perk-label text-dim">{p.label}</div>
                    <div className="sovereign-perk-desc text-dim">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="sovereign-unlock-row">
              <input
                className="sovereign-code-input font-mono"
                placeholder="Activation code…"
                value={sovereignCode}
                onChange={e => { setSovereignCode(e.target.value); setSovereignError('') }}
                onKeyDown={e => e.key === 'Enter' && unlockSovereign()}
              />
              <button className="btn-ghost sovereign-unlock-btn" onClick={unlockSovereign}>
                Unlock
              </button>
            </div>
            {sovereignError && <div className="sovereign-error">{sovereignError}</div>}
          </>
        )}
      </section>

      {/* Danger zone */}
      <section className="settings-section card" style={{ borderColor: 'var(--flame)' }}>
        <h3 className="settings-heading" style={{ color: 'var(--flame)' }}>Clear All Data</h3>
        <p className="text-dim" style={{ fontSize: 13, marginBottom: 12 }}>
          Removes all progress, journal entries, and assessment results. Cannot be undone.
        </p>
        <button
          className="btn-ghost"
          style={{ borderColor: 'var(--flame)', color: 'var(--flame)' }}
          onClick={handleClearData}
        >
          Clear Everything
        </button>
      </section>
      {showCovenant && (
        <CovenantView
          isRevisit={!!covenantData}
          onComplete={(cov) => {
            if (cov) setCovenantData(cov)
            setShowCovenant(false)
          }}
        />
      )}
    </div>
  )
}

function InsightManager() {
  const [insights, setInsights] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getStoreValue(KEYS.GUIDE_INSIGHTS).then(i => {
      setInsights(i || [])
      setLoaded(true)
    })
  }, [])

  async function deleteInsight(convId) {
    const updated = insights.filter(i => i.convId !== convId)
    setInsights(updated)
    await setStoreValue(KEYS.GUIDE_INSIGHTS, updated)
  }

  async function clearAll() {
    if (!window.confirm('Clear all Guide memory? The Guide will no longer reference past conversations.')) return
    setInsights([])
    await setStoreValue(KEYS.GUIDE_INSIGHTS, [])
  }

  if (!loaded || insights.length === 0) return null

  return (
    <section className="settings-section card">
      <div className="insight-manager-header">
        <h3 className="settings-heading text-dim">Guide Memory</h3>
        <button className="insight-clear-all" onClick={clearAll}>Clear all</button>
      </div>
      <p className="text-dim" style={{ fontSize: 13, marginBottom: 16 }}>
        What the Guide knows from your past conversations. Delete individual entries or clear all.
      </p>
      <div className="insight-list">
        {insights.map(insight => (
          <div key={insight.convId} className="insight-entry">
            <div className="insight-entry-top">
              <div className="insight-topic">{insight.topic}</div>
              <button
                className="insight-delete"
                onClick={() => deleteInsight(insight.convId)}
                title="Remove this insight"
              >×</button>
            </div>
            <div className="insight-date text-dim">{new Date(insight.date).toLocaleDateString()}</div>
            {insight.statements?.length > 0 && (
              <div className="insight-statements">
                {insight.statements.map((s, i) => (
                  <div key={i} className="insight-statement text-dim">"{s}"</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
