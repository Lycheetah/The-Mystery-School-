import React, { useState, useMemo } from 'react'
import { getCosmosSnapshot } from '../../engine/cosmos'
import './SkyPanel.css'

export default function SkyPanel({ hemisphere = 'n', collapsed: initCollapsed = true }) {
  const [collapsed, setCollapsed] = useState(initCollapsed)

  const sky = useMemo(() => getCosmosSnapshot(new Date(), hemisphere), [hemisphere])

  const rxActive = sky.retrogrades.filter(r => r.planet === 'Mercury')

  return (
    <div className="sky-panel">
      <button className="sky-panel-toggle" onClick={() => setCollapsed(c => !c)}>
        <span className="sky-toggle-moon">{sky.moon.glyph}</span>
        <span className="sky-toggle-label">
          {sky.moon.name}
          {rxActive.length > 0 && <span className="sky-rx-badge"> ℞</span>}
          {sky.nearestThreshold?.daysAway <= 7 && (
            <span className="sky-threshold-badge"> {sky.nearestThreshold.glyph}</span>
          )}
        </span>
        <span className="sky-toggle-chevron">{collapsed ? '▿' : '▵'}</span>
      </button>

      {!collapsed && (
        <div className="sky-panel-body">
          {/* Moon */}
          <div className="sky-section">
            <div className="sky-section-head text-dim">Moon</div>
            <div className="sky-row">
              <span className="sky-glyph">{sky.moon.glyph}</span>
              <span className="sky-label">{sky.moon.name}</span>
              <span className="sky-dim text-dim">{Math.round(sky.moon.illumination * 100)}% illuminated</span>
            </div>
            <div className="sky-row">
              <span className="sky-glyph">{sky.moonSign.glyph}</span>
              <span className="sky-label">Moon in {sky.moonSign.name}</span>
            </div>
          </div>

          {/* Sun */}
          <div className="sky-section">
            <div className="sky-section-head text-dim">Sun</div>
            <div className="sky-row">
              <span className="sky-glyph">{sky.sunSign.glyph}</span>
              <span className="sky-label">Sun in {sky.sunSign.name}</span>
            </div>
          </div>

          {/* Retrogrades */}
          {sky.retrogrades.length > 0 && (
            <div className="sky-section">
              <div className="sky-section-head text-dim">Retrograde</div>
              {sky.retrogrades.map((r, i) => (
                <div key={i} className="sky-row sky-rx-row">
                  <span className="sky-rx-planet">℞ {r.planet}</span>
                  <span className="sky-dim text-dim">{r.label} → direct {r.end}</span>
                </div>
              ))}
            </div>
          )}

          {/* Seasonal threshold */}
          {sky.nearestThreshold && (
            <div className="sky-section">
              <div className="sky-section-head text-dim">Wheel of the Year</div>
              <div className="sky-row">
                <span className="sky-glyph">{sky.nearestThreshold.glyph}</span>
                <div>
                  <div className="sky-label">{sky.nearestThreshold.name}</div>
                  <div className="sky-dim text-dim sky-threshold-note">
                    {sky.nearestThreshold.daysAway === 0
                      ? 'Today — the threshold is open'
                      : sky.nearestThreshold.daysAway <= 7
                        ? `${sky.nearestThreshold.daysAway} days away`
                        : sky.nearestThreshold.date}
                    {' · '}{sky.nearestThreshold.energy}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Moon ceremony note */}
          {(sky.moon.isFull || sky.moon.isNew) && (
            <div className="sky-ceremony-note">
              <span className="sky-glyph">{sky.moon.glyph}</span>
              <span>
                {sky.moon.isFull
                  ? 'Full Moon — a night for completion and release'
                  : 'New Moon — a night for intention and beginning'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
