import React, { useState } from 'react'
import './BodyMap.css'

const REGIONS = [
  { id: 'head',         label: 'Head',         cx: 100, cy: 42,  r: 18 },
  { id: 'throat',       label: 'Throat',       cx: 100, cy: 72,  r: 10 },
  { id: 'heart',        label: 'Heart',        cx: 100, cy: 100, r: 14 },
  { id: 'solar_plexus', label: 'Solar Plexus', cx: 100, cy: 125, r: 12 },
  { id: 'belly',        label: 'Belly',        cx: 100, cy: 150, r: 13 },
  { id: 'hips',         label: 'Hips',         cx: 100, cy: 175, r: 15 },
  { id: 'left_hand',    label: 'Left Hand',    cx: 58,  cy: 120, r: 10 },
  { id: 'right_hand',   label: 'Right Hand',   cx: 142, cy: 120, r: 10 },
  { id: 'feet',         label: 'Feet',         cx: 100, cy: 215, r: 14 },
  { id: 'field',        label: 'Field',        cx: 100, cy: 100, r: 0  }, // virtual
]

const QUALITY_LABELS = ['tight', 'heavy', 'numb', 'tingling', 'warm', 'open', 'light', 'buzzing']

export default function BodyMap({ practiceType, onSave, onSkip }) {
  const [active, setActive] = useState({}) // { regionId: qualityLabel | '' }
  const [fieldNote, setFieldNote] = useState('')
  const [showField, setShowField] = useState(false)

  function toggleRegion(id) {
    if (id === 'field') { setShowField(s => !s); return }
    setActive(prev => {
      if (prev[id] !== undefined) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: '' }
    })
  }

  function setQuality(id, q) {
    setActive(prev => ({ ...prev, [id]: q }))
  }

  function handleSave() {
    const regions = Object.entries(active).map(([id, quality]) => ({
      id,
      label: REGIONS.find(r => r.id === id)?.label || id,
      quality: quality || null,
    }))
    if (showField && fieldNote.trim()) {
      regions.push({ id: 'field', label: 'Field', quality: fieldNote.trim() })
    }
    onSave(regions)
  }

  const selectedRegion = Object.keys(active)[Object.keys(active).length - 1] || null

  return (
    <div className="bodymap-overlay">
      <div className="bodymap-panel">
        <div className="bodymap-header">
          <span className="bodymap-title font-serif">Where did you feel it?</span>
          <p className="bodymap-sub text-dim">Tap regions on the body. Optional — skip if nothing arose.</p>
        </div>

        <div className="bodymap-content">
          {/* SVG body */}
          <svg className="bodymap-svg" viewBox="0 0 200 260" aria-label="Body map">
            {/* Body outline */}
            <ellipse cx="100" cy="42" rx="17" ry="18" fill="none" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="78" y="60" width="44" height="70" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="55" y="65" width="22" height="55" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="123" y="65" width="22" height="55" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="82" y="130" width="16" height="60" rx="6" fill="none" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="102" y="130" width="16" height="60" rx="6" fill="none" stroke="var(--border)" strokeWidth="1.5" />

            {/* Tappable regions (skip field which is virtual) */}
            {REGIONS.filter(r => r.r > 0).map(r => {
              const isActive = active[r.id] !== undefined
              return (
                <circle
                  key={r.id}
                  cx={r.cx} cy={r.cy} r={r.r}
                  className={`bodymap-region ${isActive ? 'bodymap-region--active' : ''}`}
                  onClick={() => toggleRegion(r.id)}
                />
              )
            })}
          </svg>

          {/* Region labels & quality selection */}
          <div className="bodymap-regions-list">
            {Object.keys(active).length === 0 && !showField && (
              <p className="text-dim bodymap-hint">Tap a region to mark it</p>
            )}
            {Object.entries(active).map(([id, quality]) => {
              const region = REGIONS.find(r => r.id === id)
              return (
                <div key={id} className="bodymap-region-row">
                  <span className="bodymap-region-label">{region?.label}</span>
                  <div className="bodymap-qualities">
                    {QUALITY_LABELS.map(q => (
                      <button
                        key={q}
                        className={`bodymap-quality-btn ${quality === q ? 'bodymap-quality-btn--active' : ''}`}
                        onClick={() => setQuality(id, q)}
                      >{q}</button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Field note */}
            <button className="bodymap-field-btn text-dim" onClick={() => setShowField(s => !s)}>
              {showField ? '− hide field note' : '+ wider field / beyond body'}
            </button>
            {showField && (
              <textarea
                className="bodymap-field-textarea"
                placeholder="Describe what you noticed in the wider field..."
                value={fieldNote}
                onChange={e => setFieldNote(e.target.value)}
                rows={3}
              />
            )}
          </div>
        </div>

        <div className="bodymap-actions">
          <button className="bodymap-btn bodymap-btn--save" onClick={handleSave}>
            Save somatic map
          </button>
          <button className="bodymap-btn bodymap-btn--skip text-dim" onClick={onSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
