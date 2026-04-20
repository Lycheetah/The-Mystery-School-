import React, { useState, useEffect } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { getArcTypes } from '../../data/ceremonies'
import { startCeremony, getTodayContent, markDayComplete, getDaysRemaining, isDayAvailable } from '../../engine/ceremonyArcs'
import { generateSigil } from '../../engine/sigilGenerator'
import { KEYS } from '../../data/schema'
import { PHASE_COLOURS } from '../../theme/colours'
import './ThresholdsView.css'

const ARC_LENGTHS = [
  { days: 3,  label: '3-Day',  desc: 'A concentrated passage' },
  { days: 7,  label: '7-Day',  desc: 'A full week of deepening' },
  { days: 40, label: '40-Day', desc: 'The complete arc of transformation' },
]

export default function ThresholdsView() {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || state?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8B7ACC'

  const [view, setView]             = useState('home')  // home | choose | active | complete | registry
  const [active, setActive]         = useState(null)
  const [registry, setRegistry]     = useState([])
  const [selectedArc, setSelectedArc] = useState(null)
  const [selectedLength, setSelectedLength] = useState(7)
  const [intention, setIntention]   = useState('')
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.ACTIVE_CEREMONY),
      getStoreValue(KEYS.THRESHOLD_REGISTRY),
    ]).then(([active_, reg]) => {
      setActive(active_ || null)
      setRegistry(reg || [])
      if (active_?.active) setView('active')
    })
  }, [])

  async function handleStartCeremony() {
    if (!selectedArc) return
    const ceremony = startCeremony(selectedArc, selectedLength, intention)
    await setStoreValue(KEYS.ACTIVE_CEREMONY, ceremony)
    setActive(ceremony)
    setView('active')
    setIntention('')
  }

  async function handleCompleteDay() {
    if (!active) return
    const updated = markDayComplete(active)
    await setStoreValue(KEYS.ACTIVE_CEREMONY, updated)

    if (!updated.active) {
      // Ceremony complete — generate sigil, archive
      const seed = `ceremony:${active.arcId}:${active.startDate}`
      const sigil = generateSigil(seed, 120)
      const record = {
        id: active.id,
        arcId: active.arcId,
        arcLength: active.arcLength,
        intention: active.intention,
        startDate: active.startDate,
        completedAt: new Date().toISOString(),
        sigil,
      }
      const newRegistry = [record, ...registry]
      await setStoreValue(KEYS.THRESHOLD_REGISTRY, newRegistry)
      await setStoreValue(KEYS.ACTIVE_CEREMONY, null)
      setRegistry(newRegistry)
      setActive(null)
      setView('complete')
    } else {
      setActive(updated)
      setJournalText('')
      setJournalSaved(false)
    }
  }

  async function handleAbandon() {
    await setStoreValue(KEYS.ACTIVE_CEREMONY, null)
    setActive(null)
    setView('home')
  }

  const arcTypes = getArcTypes()

  if (view === 'choose') {
    return (
      <div className="thresh-view">
        <div className="thresh-header">
          <button className="thresh-back-btn text-dim" onClick={() => setView('home')}>←</button>
          <h2 className="thresh-title font-serif">Begin a Ceremony Arc</h2>
        </div>

        <p className="thresh-intro text-dim">
          Choose the threshold you are crossing. Then choose the arc length — how many days you will walk it.
        </p>

        <div className="thresh-section-label text-dim font-mono">The Threshold</div>
        <div className="thresh-arc-list">
          {arcTypes.map(a => (
            <button
              key={a.id}
              className={`thresh-arc-card ${selectedArc === a.id ? 'thresh-arc-card--active' : ''}`}
              style={selectedArc === a.id ? { borderColor: phaseColour } : {}}
              onClick={() => setSelectedArc(a.id)}
            >
              <span className="thresh-arc-glyph">{a.glyph}</span>
              <div>
                <div className="thresh-arc-name">{a.name}</div>
                <div className="thresh-arc-subtitle text-dim">{a.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {selectedArc && (
          <>
            <div className="thresh-section-label text-dim font-mono" style={{ marginTop: '1.25rem' }}>Arc Length</div>
            <div className="thresh-length-row">
              {ARC_LENGTHS.map(l => (
                <button
                  key={l.days}
                  className={`thresh-length-btn ${selectedLength === l.days ? 'thresh-length-btn--active' : ''}`}
                  style={selectedLength === l.days ? { borderColor: phaseColour, color: phaseColour } : {}}
                  onClick={() => setSelectedLength(l.days)}
                >
                  <div className="thresh-length-label">{l.label}</div>
                  <div className="thresh-length-desc text-dim">{l.desc}</div>
                </button>
              ))}
            </div>

            <div className="thresh-section-label text-dim font-mono" style={{ marginTop: '1rem' }}>Intention (optional)</div>
            <textarea
              className="thresh-intention-input"
              placeholder="What brings you to this threshold? State it in your own words."
              value={intention}
              onChange={e => setIntention(e.target.value)}
              rows={3}
            />

            <button
              className="thresh-begin-btn"
              style={{ borderColor: phaseColour, color: phaseColour }}
              onClick={handleStartCeremony}
            >
              Begin the {selectedLength}-Day Arc →
            </button>
          </>
        )}
      </div>
    )
  }

  if (view === 'active' && active) {
    const content = getTodayContent(active)
    const daysLeft = getDaysRemaining(active)
    const dayAvailable = isDayAvailable(active)
    const arcType = arcTypes.find(a => a.id === active.arcId)

    return (
      <div className="thresh-view">
        <div className="thresh-active-header">
          <span className="thresh-active-glyph">{arcType?.glyph}</span>
          <div className="thresh-active-meta">
            <div className="thresh-active-name font-serif">{arcType?.name}</div>
            <div className="text-dim thresh-active-progress">
              Day {content.dayNum} of {content.arcLength} · {daysLeft} remaining
            </div>
          </div>
          <button className="thresh-abandon-btn text-dim" onClick={handleAbandon} title="Abandon arc">✕</button>
        </div>

        <div className="thresh-progress-bar">
          <div
            className="thresh-progress-fill"
            style={{ width: `${(content.dayNum / content.arcLength) * 100}%`, background: phaseColour }}
          />
        </div>

        {active.intention && (
          <div className="thresh-intention-banner text-dim">
            "{active.intention}"
          </div>
        )}

        {content.phaseLabel && (
          <div className="thresh-phase-label text-dim font-mono">{content.phaseLabel}</div>
        )}

        <div className="thresh-day-content">
          <div className="thresh-reading font-serif">{content.reading}</div>

          <div className="thresh-section">
            <div className="thresh-section-head text-dim font-mono">Practice</div>
            <p className="thresh-practice-text">{content.practice}</p>
          </div>

          <div className="thresh-section">
            <div className="thresh-section-head text-dim font-mono">Journal prompt</div>
            <p className="thresh-prompt-text font-serif">"{content.prompt}"</p>
          </div>

          <div className="thresh-section">
            <div className="thresh-section-head text-dim font-mono">Your response</div>
            <textarea
              className="thresh-journal-input"
              placeholder="Write what arises…"
              value={journalText}
              onChange={e => { setJournalText(e.target.value); setJournalSaved(false) }}
              rows={5}
            />
          </div>
        </div>

        {content.isLast && content.closing && (
          <div className="thresh-closing font-serif">{content.closing}</div>
        )}

        <button
          className="thresh-complete-day-btn"
          style={{ borderColor: phaseColour, color: phaseColour }}
          onClick={handleCompleteDay}
          disabled={!dayAvailable}
        >
          {content.isLast ? 'Complete the Arc ✦' : `Mark Day ${content.dayNum} Complete →`}
        </button>

        {!dayAvailable && (
          <p className="thresh-wait-note text-dim">
            Return tomorrow for the next day of the arc.
          </p>
        )}
      </div>
    )
  }

  if (view === 'complete') {
    const last = registry[0]
    return (
      <div className="thresh-view thresh-complete-view">
        <div className="thresh-complete-header">
          <h2 className="thresh-title font-serif">Arc Complete</h2>
          <p className="text-dim thresh-complete-sub">The passage has been walked.</p>
        </div>
        {last?.sigil && (
          <div
            className="thresh-sigil"
            dangerouslySetInnerHTML={{ __html: last.sigil }}
          />
        )}
        <p className="thresh-sigil-note text-dim">
          Your sigil — forged from this specific passage.
        </p>
        <button
          className="thresh-begin-btn"
          style={{ borderColor: phaseColour, color: phaseColour }}
          onClick={() => setView('home')}
        >
          Return to Thresholds
        </button>
      </div>
    )
  }

  if (view === 'registry') {
    return (
      <div className="thresh-view">
        <div className="thresh-header">
          <button className="thresh-back-btn text-dim" onClick={() => setView('home')}>←</button>
          <h2 className="thresh-title font-serif">Threshold Registry</h2>
        </div>
        {registry.length === 0 ? (
          <p className="thresh-intro text-dim">No completed ceremony arcs yet.</p>
        ) : (
          <div className="thresh-registry-list">
            {registry.map(r => {
              const arc = arcTypes.find(a => a.id === r.arcId)
              return (
                <div key={r.id} className="thresh-registry-row">
                  <div className="thresh-registry-top">
                    <span className="thresh-registry-glyph">{arc?.glyph}</span>
                    <div>
                      <div className="thresh-registry-name">{arc?.name} — {r.arcLength}-Day Arc</div>
                      <div className="thresh-registry-date text-dim">{r.startDate} → {r.completedAt?.slice(0, 10)}</div>
                    </div>
                  </div>
                  {r.intention && <p className="thresh-registry-intention text-dim">"{r.intention}"</p>}
                  {r.sigil && <div className="thresh-registry-sigil" dangerouslySetInnerHTML={{ __html: r.sigil }} />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Home
  return (
    <div className="thresh-view">
      <div className="thresh-header-home">
        <span className="thresh-home-glyph font-mono">⊗</span>
        <h2 className="thresh-title font-serif">Thresholds</h2>
      </div>
      <p className="thresh-intro text-dim">
        Major passages deserve ceremonial structure. Choose a threshold, choose an arc length, and walk it day by day.
      </p>

      {active?.active ? (
        <button
          className="thresh-resume-card"
          style={{ borderColor: phaseColour }}
          onClick={() => setView('active')}
        >
          <div className="thresh-resume-top">
            <span>Continue Active Arc</span>
            <span className="text-dim thresh-resume-progress">
              Day {active.dayIndex + 1} / {active.arcLength}
            </span>
          </div>
          <div className="text-dim thresh-resume-sub">
            {arcTypes.find(a => a.id === active.arcId)?.name} · {active.arcLength}-Day
          </div>
        </button>
      ) : (
        <button
          className="thresh-begin-btn"
          style={{ borderColor: phaseColour, color: phaseColour }}
          onClick={() => setView('choose')}
        >
          Begin a Ceremony Arc →
        </button>
      )}

      {registry.length > 0 && (
        <button
          className="thresh-registry-btn text-dim"
          onClick={() => setView('registry')}
        >
          Threshold Registry ({registry.length} completed)
        </button>
      )}

      <div className="thresh-arc-preview">
        <div className="thresh-section-label text-dim font-mono">Available Arcs</div>
        {arcTypes.map(a => (
          <div key={a.id} className="thresh-preview-row">
            <span className="thresh-preview-glyph">{a.glyph}</span>
            <div>
              <div className="thresh-preview-name">{a.name}</div>
              <div className="thresh-preview-desc text-dim">{a.description.slice(0, 80)}…</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
