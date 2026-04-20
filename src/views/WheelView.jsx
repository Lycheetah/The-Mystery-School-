import React, { useState, useEffect, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { getUpcomingThresholds, getNearestThreshold } from '../../engine/cosmos'
import { getWheelNode, getAllThresholdNames } from '../../engine/wheel'
import { KEYS } from '../../data/schema'
import { PHASE_COLOURS } from '../../theme/colours'
import './WheelView.css'

export default function WheelView({ onClose }) {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || state?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8B7ACC'

  const [hemisphere, setHemisphere] = useState('n')
  const [record, setRecord]         = useState([])
  const [selected, setSelected]     = useState(null)  // threshold name
  const [reflection, setReflection] = useState('')
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.HEMISPHERE),
      getStoreValue(KEYS.WHEEL_RECORD),
    ]).then(([hemi, rec]) => {
      setHemisphere(hemi || 'n')
      setRecord(rec || [])
    })
  }, [])

  const nearest = useMemo(() => getNearestThreshold(new Date(), hemisphere), [hemisphere])
  const upcoming = useMemo(() => getUpcomingThresholds(new Date(), hemisphere, 4), [hemisphere])

  function openThreshold(name) {
    const existing = record.find(r => r.name === name)
    setReflection(existing?.reflection || '')
    setSaved(false)
    setSelected(name)
  }

  async function saveReflection() {
    const date = new Date().toISOString().slice(0, 10)
    const node = getWheelNode(selected)
    const entry = { name: selected, date, reflection, glyph: node?.glyph || '◯' }
    const updated = [
      entry,
      ...record.filter(r => !(r.name === selected && r.date.startsWith(date.slice(0, 7)))),
    ].slice(0, 200)
    await setStoreValue(KEYS.WHEEL_RECORD, updated)
    setRecord(updated)
    setSaved(true)
  }

  if (selected) {
    const node = getWheelNode(selected)
    if (!node) return null
    return (
      <div className="wheel-overlay">
        <div className="wheel-panel">
          <div className="wheel-threshold-header">
            <button className="wheel-back-btn text-dim" onClick={() => setSelected(null)}>← Back</button>
            <span className="wheel-threshold-glyph">{node.glyph}</span>
            <h2 className="wheel-threshold-title font-serif">{selected}</h2>
            <span className="wheel-threshold-energy text-dim">{node.energy}</span>
          </div>

          <div className="wheel-threshold-body">
            <div className="wheel-reading font-serif">{node.reading}</div>

            <div className="wheel-section">
              <div className="wheel-section-label text-dim font-mono">Practice</div>
              <p className="wheel-practice-text">{node.practice}</p>
            </div>

            <div className="wheel-section">
              <div className="wheel-section-label text-dim font-mono">Reflection prompt</div>
              <p className="wheel-prompt-text font-serif">"{node.prompt}"</p>
            </div>

            <div className="wheel-section">
              <div className="wheel-section-label text-dim font-mono">Your reflection</div>
              <textarea
                className="wheel-reflection-input"
                placeholder="Write what this threshold holds for you…"
                value={reflection}
                onChange={e => { setReflection(e.target.value); setSaved(false) }}
                rows={5}
              />
              <button
                className="wheel-save-btn"
                style={{ borderColor: phaseColour, color: phaseColour }}
                onClick={saveReflection}
                disabled={!reflection.trim()}
              >
                {saved ? 'Saved ✓' : 'Save reflection'}
              </button>
            </div>

            <div className="wheel-themes">
              {node.themes.map((t, i) => (
                <span key={i} className="wheel-theme-chip text-dim">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wheel-overlay">
      <div className="wheel-panel">
        <div className="wheel-header">
          <span className="wheel-header-glyph font-mono">⊗</span>
          <h2 className="wheel-header-title font-serif">Wheel of the Year</h2>
          <button className="wheel-close-btn text-dim" onClick={onClose}>✕</button>
        </div>

        {/* Nearest threshold highlight */}
        {nearest && (
          <button
            className="wheel-nearest-card"
            style={{ borderColor: phaseColour }}
            onClick={() => openThreshold(nearest.name)}
          >
            <span className="wheel-nearest-glyph">{nearest.glyph}</span>
            <div className="wheel-nearest-info">
              <div className="wheel-nearest-name">{nearest.name}</div>
              <div className="wheel-nearest-when text-dim">
                {nearest.daysAway === 0
                  ? 'Today — the threshold is open'
                  : nearest.daysAway <= 7
                    ? `${nearest.daysAway} days away · ${nearest.energy}`
                    : `${nearest.date} · ${nearest.energy}`}
              </div>
            </div>
            <span className="text-dim" style={{ fontSize: 12 }}>→</span>
          </button>
        )}

        {/* Year ring */}
        <WheelRing
          record={record}
          hemisphere={hemisphere}
          nearest={nearest}
          onSelect={openThreshold}
          phaseColour={phaseColour}
        />

        {/* Upcoming thresholds */}
        <div className="wheel-upcoming">
          <div className="wheel-section-label text-dim font-mono">Upcoming</div>
          {upcoming.map((t, i) => {
            const node = getWheelNode(t.name)
            const done = record.some(r => r.name === t.name)
            return (
              <button
                key={i}
                className={`wheel-upcoming-row ${done ? 'wheel-upcoming-row--done' : ''}`}
                onClick={() => openThreshold(t.name)}
              >
                <span className="wheel-upcoming-glyph">{t.glyph}</span>
                <div className="wheel-upcoming-info">
                  <span className="wheel-upcoming-name">{t.name}</span>
                  <span className="wheel-upcoming-energy text-dim">{t.energy}</span>
                </div>
                <span className="wheel-upcoming-when text-dim">
                  {t.daysAway === 0 ? 'today' : `${t.daysAway}d`}
                </span>
              </button>
            )
          })}
        </div>

        {/* Archive */}
        {record.length > 0 && (
          <div className="wheel-archive">
            <div className="wheel-section-label text-dim font-mono">Archive</div>
            {record.slice(0, 12).map((r, i) => (
              <button
                key={i}
                className="wheel-archive-row"
                onClick={() => openThreshold(r.name)}
              >
                <span className="text-dim wheel-archive-glyph">{r.glyph}</span>
                <span className="wheel-archive-name">{r.name}</span>
                <span className="wheel-archive-date text-dim">{r.date}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Year Ring SVG ────────────────────────────────────────────────────────────

function WheelRing({ record, hemisphere, nearest, onSelect, phaseColour }) {
  const names = getAllThresholdNames()
  const cx = 130, cy = 130, r = 100, r2 = 70

  const recordNames = new Set(record.map(r => r.name))

  return (
    <div className="wheel-ring-wrap">
      <svg viewBox="0 0 260 260" className="wheel-ring-svg">
        {/* Outer and inner circles */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 5" />

        {names.map((name, i) => {
          const angle = (i / names.length) * 2 * Math.PI - Math.PI / 2
          const nx = cx + Math.cos(angle) * r
          const ny = cy + Math.sin(angle) * r
          const node = getWheelNode(name)
          const isNearest = nearest?.name === name
          const isDone = recordNames.has(name)

          const labelR = r + 18
          const lx = cx + Math.cos(angle) * labelR
          const ly = cy + Math.sin(angle) * labelR

          return (
            <g key={name} onClick={() => onSelect(name)} style={{ cursor: 'pointer' }}>
              <line
                x1={cx} y1={cy}
                x2={nx} y2={ny}
                stroke={isNearest ? phaseColour : 'var(--border)'}
                strokeWidth={isNearest ? 1.5 : 0.5}
                opacity={0.4}
              />
              <circle
                cx={nx} cy={ny} r={isNearest ? 8 : 6}
                fill={isDone ? phaseColour : 'var(--bg-secondary)'}
                stroke={isNearest ? phaseColour : 'var(--border)'}
                strokeWidth={isNearest ? 1.5 : 1}
              />
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isNearest ? '11' : '10'}
                fill={isNearest ? phaseColour : 'var(--text-secondary)'}
              >
                {node?.glyph || '◯'}
              </text>
            </g>
          )
        })}

        {/* Centre */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fill="var(--accent)" dominantBaseline="middle">⊗</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">the wheel</text>
      </svg>
    </div>
  )
}
