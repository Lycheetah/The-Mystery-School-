import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { SUBJECTS } from '../../data/subjects'
import { MASTERY_LEVELS, KEYS } from '../../data/schema'
import { PHASE_COLOURS } from '../../theme/colours'
import { meetsUnlockCondition } from '../../engine/uncommonRoom'
import { DOORS } from '../../engine/doors'
import './SpiralView.css'

// ─── Domain glyph map ──────────────────────────────────────────────────────────

const DOMAIN_GLYPHS = {
  'Meditation & Contemplative Arts':  '●',
  'Alchemy & Transformation':         '⊗',
  'Divination & Symbolic Systems':    '✦',
  'Shamanic Arts':                    '≋',
  'Energy Healing':                   '◈',
  'Sacred Sexuality':                 '∞',
  'Death Work & Grief':               '◯',
  'Plant Medicine':                   '✿',
  'Ritual Arts':                      '⊕',
  'Movement & Somatic':               '∿',
  'Dream Work':                       '∗',
  'AI & Technology':                  'Π',
  'Shadow Work & Psychology':         '⊘',
  'Breathwork & Pranayama':           '□',
  'Kabbalah & Tree of Life':          '✧',
  'Sufism & Islamic Mysticism':       '◌',
  'Christian Mysticism':              '✠',
  'Hindu Philosophy & Yoga':          '◎',
  'Buddhist Deep Practice':           '⧖',
  'Taoism & Chinese Wisdom':          '☯',
  'Indigenous Knowledge Systems':     '◉',
  'Sacred Geometry & Mathematics':    '∆',
  'Astrology & Cosmic Cycles':        '⟟',
  'Sound, Vibration & Cymatics':      '≈',
  'The Dismissed Pioneers':           'Φ',
  'Practical Sovereignty':            '⊡',
  'African Spiritual Traditions':     '⊛',
  'Philosophy & Epistemology':        'Ψ',
}

// ─── Group subjects by domain ─────────────────────────────────────────────────

function groupByDomain(subjects) {
  const map = {}
  subjects.forEach(s => {
    if (!map[s.domain]) map[s.domain] = []
    map[s.domain].push(s)
  })
  return map
}

export default function SpiralView() {
  const { state } = useStore()
  const phase = state?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8B7ACC'
  const progress = state?.progress || {}

  const [tooltip, setTooltip] = useState(null)  // { name, mastery, x, y }
  const [filterDomain, setFilterDomain] = useState(null)
  const [activeTab, setActiveTab] = useState('map')  // 'map' | 'stats' | 'evidence'
  const [practiceLog, setPracticeLog] = useState([])
  const [streaks, setStreaks] = useState(null)
  const [eggClicks, setEggClicks] = useState(0)
  const [doorCrossings, setDoorCrossings] = useState([])

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.PRACTICE_LOG),
      getStoreValue(KEYS.STREAKS),
      getStoreValue(KEYS.DOOR_CROSSINGS),
    ]).then(([log, s, crossings]) => {
      setPracticeLog(log || [])
      setStreaks(s || null)
      setDoorCrossings(crossings || [])
    })
  }, [])
  const [eggUnlocked, setEggUnlocked] = useState(false)
  const eggTimerRef = useRef(null)

  async function handleGlyphClick() {
    const already = await getStoreValue(KEYS.UNLOCKED_ROOM)
    if (already) return

    setEggClicks(prev => {
      const next = prev + 1
      // Reset the decay timer
      if (eggTimerRef.current) clearTimeout(eggTimerRef.current)
      eggTimerRef.current = setTimeout(() => setEggClicks(0), 2500)
      if (next >= 5) {
        // Unlock!
        setStoreValue(KEYS.UNLOCKED_ROOM, true)
        setEggUnlocked(true)
        setTimeout(() => setEggUnlocked(false), 4000)
        clearTimeout(eggTimerRef.current)
        return 0
      }
      return next
    })
  }

  const byDomain = useMemo(() => groupByDomain(SUBJECTS), [])
  const domains = Object.keys(byDomain)

  // Global stats
  const stats = useMemo(() => {
    let touched = 0, integrated = 0, practising = 0, reading = 0, aware = 0
    SUBJECTS.forEach(s => {
      const m = progress[s.id]?.mastery || 0
      if (m >= 1) touched++
      if (m === 4) integrated++
      if (m === 3) practising++
      if (m === 2) reading++
      if (m === 1) aware++
    })
    return { touched, integrated, practising, reading, aware, total: SUBJECTS.length }
  }, [progress])

  const displayDomains = filterDomain ? [filterDomain] : domains

  return (
    <div className="spiral-layout">
      {/* Header */}
      <div className="spiral-header">
        <div className="spiral-title-row">
          <span
            className="font-mono spiral-glyph"
            style={{ color: phaseColour, cursor: 'default', userSelect: 'none' }}
            onClick={handleGlyphClick}
            title={eggClicks > 0 ? `${eggClicks}/5` : undefined}
          >⟲</span>
          <div>
            <h2 className="font-serif spiral-title">The Journey</h2>
            <p className="text-dim spiral-subtitle">All 220 subjects. Every dot is a threshold.</p>
          </div>
        </div>

        {eggUnlocked && (
          <div className="spiral-egg-banner">
            <span className="font-mono" style={{ color: '#C9A84C' }}>◬</span>
            {' '}The Uncommon Room has opened. Find it in Study.
          </div>
        )}

        {/* Stats bar */}
        <div className="spiral-stats">
          <StatPill label="Touched"    value={stats.touched}    colour="#7C9AB8" total={stats.total} />
          <StatPill label="Aware"      value={stats.aware}      colour="#7C9AB8" />
          <StatPill label="Reading"    value={stats.reading}    colour="#8B7ACC" />
          <StatPill label="Practising" value={stats.practising} colour="#C9A84C" />
          <StatPill label="Integrated" value={stats.integrated} colour="#6BAA80" />
          <div className="spiral-stat-total">
            <span className="font-mono" style={{ color: phaseColour }}>{stats.touched}</span>
            <span className="text-dim"> / {stats.total} subjects</span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="spiral-overall-bar">
          <div className="spiral-bar-track">
            {[
              { count: stats.aware,      colour: '#7C9AB8' },
              { count: stats.reading,    colour: '#8B7ACC' },
              { count: stats.practising, colour: '#C9A84C' },
              { count: stats.integrated, colour: '#6BAA80' },
            ].map((seg, i) => (
              <div
                key={i}
                className="spiral-bar-seg"
                style={{
                  width: `${(seg.count / stats.total) * 100}%`,
                  background: seg.colour,
                }}
              />
            ))}
          </div>
          <span className="font-mono text-dim spiral-bar-pct">
            {Math.round((stats.touched / stats.total) * 100)}%
          </span>
        </div>

        {/* View tabs */}
        <div className="spiral-view-tabs">
          <button
            className={`spiral-view-tab ${activeTab === 'map' ? 'spiral-view-tab--active' : ''}`}
            onClick={() => setActiveTab('map')}
          >✧ Map</button>
          <button
            className={`spiral-view-tab ${activeTab === 'constellation' ? 'spiral-view-tab--active' : ''}`}
            onClick={() => setActiveTab('constellation')}
          >∗ Constellation</button>
          <button
            className={`spiral-view-tab ${activeTab === 'stats' ? 'spiral-view-tab--active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >≋ Practice Stats</button>
          <button
            className={`spiral-view-tab ${activeTab === 'evidence' ? 'spiral-view-tab--active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >Π Evidence</button>
          <button
            className={`spiral-view-tab ${activeTab === 'body' ? 'spiral-view-tab--active' : ''}`}
            onClick={() => setActiveTab('body')}
          >∿ Body</button>
        </div>

        {/* Domain filter pills — only in map mode */}
        {activeTab === 'map' && <div className="spiral-domain-filters">
          <button
            className={`filter-chip ${!filterDomain ? 'filter-chip--active' : ''}`}
            onClick={() => setFilterDomain(null)}
          >All domains</button>
          {domains.map(d => (
            <button
              key={d}
              className={`filter-chip ${filterDomain === d ? 'filter-chip--active' : ''}`}
              onClick={() => setFilterDomain(filterDomain === d ? null : d)}
            >
              <span className="font-mono">{DOMAIN_GLYPHS[d] || '·'}</span> {d.split(' ')[0]}
            </button>
          ))}
        </div>}
      </div>

      {/* Constellation mode */}
      {activeTab === 'constellation' && (
        <ConstellationView subjects={SUBJECTS} progress={progress} phaseColour={phaseColour} />
      )}

      {/* Domain cards (map mode) */}
      {activeTab === 'map' && (
        <div className="spiral-grid">
          {displayDomains.map(domain => (
            <DomainCard
              key={domain}
              domain={domain}
              subjects={byDomain[domain]}
              progress={progress}
              phaseColour={phaseColour}
              onTooltip={setTooltip}
              expanded={!!filterDomain}
            />
          ))}
        </div>
      )}

      {/* Stats panel */}
      {activeTab === 'stats' && (
        <>
          <PracticeStatsPanel
            log={practiceLog}
            streaks={streaks}
            phaseColour={phaseColour}
          />
          {doorCrossings.length > 0 && (
            <div className="codex-crossings">
              <h3 className="codex-crossings-title text-dim">Codex — Door Crossings</h3>
              {doorCrossings.map((c, i) => {
                const from = DOORS[c.fromDoor]
                const to   = DOORS[c.toDoor]
                return (
                  <div key={i} className="codex-crossing-entry">
                    <div className="codex-crossing-glyphs font-mono">
                      <span>{from?.glyph || '?'}</span>
                      <span className="text-dim"> → </span>
                      <span style={{ color: phaseColour }}>{to?.glyph || '?'}</span>
                    </div>
                    <div className="codex-crossing-info">
                      <div className="codex-crossing-name">
                        {from?.name || c.fromDoor} → {to?.name || c.toDoor}
                      </div>
                      <div className="codex-crossing-date text-dim">
                        {new Date(c.crossedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      {c.intention && (
                        <div className="codex-crossing-intention text-dim">
                          "{c.intention}"
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Evidence tab */}
      {activeTab === 'evidence' && (
        <EvidencePanel subjects={SUBJECTS} progress={progress} phaseColour={phaseColour} />
      )}

      {/* Body tab */}
      {activeTab === 'body' && (
        <SomaticHeatMap practiceLog={practiceLog} phaseColour={phaseColour} />
      )}

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="spiral-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <span className="font-mono" style={{ color: MASTERY_LEVELS[tooltip.mastery]?.colour }}>
            {MASTERY_LEVELS[tooltip.mastery]?.glyph}
          </span>
          {' '}{tooltip.name}
          {' '}<span className="text-dim">— {MASTERY_LEVELS[tooltip.mastery]?.label}</span>
        </div>
      )}
    </div>
  )
}

// ─── Constellation View ───────────────────────────────────────────────────────

function ConstellationView({ subjects, progress, phaseColour }) {
  const [hovered, setHovered] = useState(null)  // { id, name, mastery, x, y }

  const byDomain = useMemo(() => groupByDomain(subjects), [subjects])
  const domainList = useMemo(() => Object.keys(byDomain), [byDomain])

  const { nodes, edges, domainCenters } = useMemo(() => {
    const W = 1200, H = 860
    const cx = W / 2, cy = H / 2
    const ringR = 330
    const clusterR = 52

    const nodeMap = {}
    const domCenters = {}

    domainList.forEach((domain, di) => {
      const angle = (di / domainList.length) * Math.PI * 2 - Math.PI / 2
      const dx = cx + Math.cos(angle) * ringR
      const dy = cy + Math.sin(angle) * ringR
      domCenters[domain] = { x: dx, y: dy, glyph: DOMAIN_GLYPHS[domain] || '·', angle }

      const domSubjects = byDomain[domain]
      const n = domSubjects.length

      domSubjects.forEach((s, si) => {
        let sx, sy
        if (n === 1) {
          sx = dx; sy = dy
        } else if (n <= 6) {
          const a2 = (si / n) * Math.PI * 2
          sx = dx + Math.cos(a2) * (clusterR * 0.7)
          sy = dy + Math.sin(a2) * (clusterR * 0.7)
        } else {
          const innerN = Math.ceil(n * 0.4)
          const outerN = n - innerN
          if (si < innerN) {
            const a2 = (si / innerN) * Math.PI * 2
            sx = dx + Math.cos(a2) * (clusterR * 0.45)
            sy = dy + Math.sin(a2) * (clusterR * 0.45)
          } else {
            const a2 = ((si - innerN) / outerN) * Math.PI * 2
            sx = dx + Math.cos(a2) * clusterR
            sy = dy + Math.sin(a2) * clusterR
          }
        }
        nodeMap[s.id] = { x: sx, y: sy, subject: s }
      })
    })

    const edges = []
    subjects.forEach(s => {
      ;(s.prerequisites || []).forEach(prereqId => {
        if (nodeMap[prereqId] && nodeMap[s.id]) {
          edges.push({ from: prereqId, to: s.id })
        }
      })
    })

    return { nodes: nodeMap, edges, domainCenters: domCenters }
  }, [subjects, byDomain, domainList])

  const handleMouseEnter = useCallback((id, name, mastery, x, y) => {
    setHovered({ id, name, mastery, x, y })
  }, [])
  const handleMouseLeave = useCallback(() => setHovered(null), [])

  return (
    <div className="constellation-wrap">
      <div className="constellation-legend">
        {MASTERY_LEVELS.filter(m => m.level > 0).map(ml => (
          <div key={ml.level} className="constellation-legend-item">
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={ml.colour} /></svg>
            <span style={{ color: ml.colour, fontSize: 11 }}>{ml.label}</span>
          </div>
        ))}
        <div className="constellation-legend-item">
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /></svg>
          <span className="text-dim" style={{ fontSize: 11 }}>Not started</span>
        </div>
      </div>

      <svg
        viewBox="0 0 1200 860"
        className="constellation-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="600" cy="430" r="60" fill={phaseColour} opacity={0.03} />

        {edges.map((e, i) => {
          const from = nodes[e.from]
          const to = nodes[e.to]
          if (!from || !to) return null
          const fromMastered = (progress[e.from]?.mastery || 0) >= 1
          return (
            <line key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={fromMastered ? 'rgba(139,122,204,0.25)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={fromMastered ? 1.2 : 0.7}
            />
          )
        })}

        {domainList.map(domain => {
          const dc = domainCenters[domain]
          if (!dc) return null
          const dx = dc.x - 600, dy = dc.y - 430
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const labelX = dc.x + (dx / len) * 46
          const labelY = dc.y + (dy / len) * 46
          const domSubjects = byDomain[domain]
          const masteredCount = domSubjects.filter(s => (progress[s.id]?.mastery || 0) >= 1).length
          const labelOpacity = masteredCount > 0 ? 0.45 : 0.2
          return (
            <text key={domain}
              x={labelX} y={labelY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8.5" fill={`rgba(255,255,255,${labelOpacity})`} fontFamily="monospace"
            >
              {dc.glyph} {domain.split(' ').slice(0, 2).join(' ')}
            </text>
          )
        })}

        {Object.entries(nodes).map(([id, node]) => {
          const mastery = progress[id]?.mastery || 0
          const ml = MASTERY_LEVELS[mastery]
          const r = mastery >= 4 ? 6.5 : mastery >= 3 ? 5.5 : mastery >= 1 ? 4.5 : 3.5
          const isHovered = hovered?.id === id
          return (
            <g key={id}>
              {mastery >= 4 && <circle cx={node.x} cy={node.y} r={r + 5} fill={ml.colour} opacity={0.12} />}
              {mastery >= 3 && <circle cx={node.x} cy={node.y} r={r + 2.5} fill={ml.colour} opacity={0.08} />}
              {isHovered && <circle cx={node.x} cy={node.y} r={r + 6} fill="white" opacity={0.08} />}
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={mastery >= 1 ? ml.colour : 'rgba(255,255,255,0.07)'}
                stroke={mastery >= 1 ? ml.colour : 'rgba(255,255,255,0.15)'}
                strokeWidth={mastery >= 1 ? 0 : 1}
                opacity={mastery >= 1 ? (isHovered ? 1 : 0.8) : (isHovered ? 0.6 : 0.35)}
                style={{ cursor: 'default' }}
                onMouseEnter={() => handleMouseEnter(id, node.subject.name, mastery, node.x, node.y)}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          )
        })}

        {hovered && (() => {
          const textLen = Math.min(hovered.name.length * 7 + 24, 240)
          const tipX = hovered.x + 10 + textLen > 1200 ? hovered.x - textLen - 10 : hovered.x + 10
          const tipY = hovered.y - 20 < 0 ? hovered.y + 4 : hovered.y - 20
          const ml = MASTERY_LEVELS[hovered.mastery]
          return (
            <g>
              <rect x={tipX} y={tipY} width={textLen} height={22} rx={4}
                fill="rgba(10,10,15,0.93)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5}
              />
              <circle cx={tipX + 12} cy={tipY + 11} r={4} fill={ml.colour} opacity={0.9} />
              <text x={tipX + 22} y={tipY + 14.5} fontSize={11} fill="rgba(255,255,255,0.88)" fontFamily="inherit">
                {hovered.name}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, colour }) {
  if (!value) return null
  return (
    <div className="spiral-stat-pill">
      <span className="font-mono spiral-stat-glyph" style={{ color: colour }}>
        {MASTERY_LEVELS.find(m => m.label.toLowerCase().startsWith(label.toLowerCase()))?.glyph || '○'}
      </span>
      <span style={{ color: colour }}>{value}</span>
      <span className="text-dim"> {label}</span>
    </div>
  )
}

// ─── Domain card ───────────────────────────────────────────────────────────────

function DomainCard({ domain, subjects, progress, phaseColour, onTooltip, expanded }) {
  const masteryCount = subjects.filter(s => (progress[s.id]?.mastery || 0) >= 1).length
  const integratedCount = subjects.filter(s => (progress[s.id]?.mastery || 0) === 4).length
  const glyph = DOMAIN_GLYPHS[domain] || '·'

  const domColour = masteryCount === 0
    ? 'var(--text-dim)'
    : masteryCount === subjects.length
      ? '#6BAA80'
      : phaseColour

  return (
    <div className={`domain-card ${expanded ? 'domain-card--expanded' : ''}`}>
      <div className="domain-card-header">
        <span className="font-mono domain-glyph" style={{ color: domColour }}>{glyph}</span>
        <div className="domain-card-info">
          <div className="domain-card-name">{domain}</div>
          <div className="domain-card-meta text-dim font-mono">
            {masteryCount}/{subjects.length}
            {integratedCount > 0 && (
              <span style={{ color: '#6BAA80' }}> · {integratedCount} integrated</span>
            )}
          </div>
        </div>
      </div>

      {/* Mini bar */}
      <div className="domain-mini-bar">
        <div
          className="domain-mini-fill"
          style={{
            width: `${(masteryCount / subjects.length) * 100}%`,
            background: domColour,
          }}
        />
      </div>

      {/* Subject dots */}
      <div className="domain-dots">
        {subjects.map(s => {
          const mastery = progress[s.id]?.mastery || 0
          const ml = MASTERY_LEVELS[mastery]
          return (
            <span
              key={s.id}
              className="domain-dot font-mono"
              style={{ color: ml.colour }}
              onMouseEnter={e => {
                const rect = e.target.getBoundingClientRect()
                const container = document.querySelector('.spiral-layout')
                const cRect = container?.getBoundingClientRect() || { left: 0, top: 0 }
                onTooltip({
                  name: s.name,
                  mastery,
                  x: rect.left - cRect.left + rect.width / 2,
                  y: rect.top - cRect.top,
                })
              }}
              onMouseLeave={() => onTooltip(null)}
              title={`${s.name} — ${ml.label}`}
            >
              {ml.glyph}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── Practice Stats Panel (T36) ────────────────────────────────────────────────

function PracticeStatsPanel({ log, streaks, phaseColour }) {
  const TYPE_LABELS = {
    breathwork:    { label: 'Breathwork',    glyph: '□',  colour: '#88CCAA' },
    meditation:    { label: 'Meditation',    glyph: '●',  colour: '#8888CC' },
    shadow_work:   { label: 'Shadow Work',   glyph: '⊗',  colour: '#8B7ACC' },
    contemplation: { label: 'Contemplation', glyph: '◈',  colour: '#C9A84C' },
    walking:       { label: 'Walking',       glyph: '⟲',  colour: '#88B8CC' },
  }

  // By type
  const byType = {}
  let totalMins = 0
  log.forEach(s => {
    if (!byType[s.type]) byType[s.type] = { count: 0, minutes: 0 }
    byType[s.type].count++
    const m = Math.floor((s.duration || 0) / 60)
    byType[s.type].minutes += m
    totalMins += m
  })

  // Last 30 days histogram
  const today = new Date()
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  const dayMap = {}
  log.forEach(s => {
    const day = s.completedAt?.slice(0, 10)
    if (day) dayMap[day] = (dayMap[day] || 0) + 1
  })
  const maxDay = Math.max(1, ...days.map(d => dayMap[d] || 0))

  // By phase
  const byPhase = {}
  log.forEach(s => {
    const p = s.phase || 1
    byPhase[p] = (byPhase[p] || 0) + 1
  })

  if (log.length === 0) {
    return (
      <div className="practice-stats-empty">
        <span className="font-mono" style={{ fontSize: 32, color: 'var(--text-dim)' }}>≋</span>
        <p className="text-dim font-serif" style={{ fontSize: 17 }}>No sessions recorded yet.</p>
        <p className="text-dim" style={{ fontSize: 13 }}>Complete a practice to see your analytics here.</p>
      </div>
    )
  }

  return (
    <div className="practice-stats">
      {/* Streak + totals */}
      <div className="pstats-row">
        {[
          { label: 'Current streak', value: streaks?.current || 0, suffix: 'days', colour: phaseColour },
          { label: 'Longest streak', value: streaks?.longest || 0, suffix: 'days', colour: '#C9A84C' },
          { label: 'Total sessions', value: log.length, suffix: '', colour: '#88CCAA' },
          { label: 'Total minutes',  value: totalMins, suffix: 'min', colour: '#88B8CC' },
        ].map(({ label, value, suffix, colour }) => (
          <div key={label} className="pstat-card card">
            <div className="pstat-value font-mono" style={{ color: colour }}>
              {value}<span className="pstat-suffix">{suffix && ' ' + suffix}</span>
            </div>
            <div className="pstat-label text-dim">{label}</div>
          </div>
        ))}
      </div>

      {/* 30-day histogram */}
      <div className="pstats-section">
        <div className="pstats-section-label text-dim font-mono">Last 30 days</div>
        <div className="pstats-histogram">
          {days.map(day => {
            const count = dayMap[day] || 0
            const h = count ? Math.max(4, (count / maxDay) * 48) : 2
            const isToday = day === today.toISOString().slice(0, 10)
            return (
              <div key={day} className="pstats-bar-col" title={`${day}: ${count} sessions`}>
                <div
                  className="pstats-bar"
                  style={{
                    height: h,
                    background: count ? phaseColour : 'var(--border)',
                    opacity: isToday ? 1 : 0.7,
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="pstats-histogram-labels text-dim">
          <span>30d ago</span><span>Today</span>
        </div>
      </div>

      {/* By type */}
      <div className="pstats-section">
        <div className="pstats-section-label text-dim font-mono">By practice type</div>
        <div className="pstats-type-list">
          {Object.entries(byType).sort((a, b) => b[1].count - a[1].count).map(([type, data]) => {
            const info = TYPE_LABELS[type] || { label: type, glyph: '·', colour: 'var(--text-dim)' }
            return (
              <div key={type} className="pstats-type-row">
                <span className="font-mono pstats-type-glyph" style={{ color: info.colour }}>{info.glyph}</span>
                <span className="pstats-type-name">{info.label}</span>
                <div className="pstats-type-bar-wrap">
                  <div
                    className="pstats-type-bar"
                    style={{
                      width: `${(data.count / log.length) * 100}%`,
                      background: info.colour,
                    }}
                  />
                </div>
                <span className="pstats-type-count text-dim font-mono">{data.count}</span>
                <span className="pstats-type-mins text-dim">{data.minutes}m</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* By phase */}
      {Object.keys(byPhase).length > 1 && (
        <div className="pstats-section">
          <div className="pstats-section-label text-dim font-mono">By phase</div>
          <div className="pstats-phase-dots">
            {[1,2,3,4,5,6,7].map(p => {
              const count = byPhase[p] || 0
              const pc = PHASE_COLOURS[p]?.colour || '#888'
              return (
                <div key={p} className="pstats-phase-item" title={`Phase ${p}: ${count} sessions`}>
                  <div className="pstats-phase-bar-wrap">
                    <div
                      className="pstats-phase-fill"
                      style={{
                        height: count ? `${(count / log.length) * 100}%` : '2px',
                        background: count ? pc : 'var(--border)',
                      }}
                    />
                  </div>
                  <span className="font-mono text-dim" style={{ fontSize: 10, color: pc }}>{p}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Evidence panel ───────────────────────────────────────────────────────────

const PI_BANDS = [
  { min: 2.0, label: 'Solid evidence',      colour: '#6BAA80', desc: 'Π ≥ 2.0 — well-replicated, strong scientific consensus' },
  { min: 1.5, label: 'Good evidence',       colour: '#8BAA60', desc: 'Π 1.5–2.0 — credible evidence, some replication' },
  { min: 1.0, label: 'Mixed evidence',      colour: '#C9A84C', desc: 'Π 1.0–1.5 — contested or limited studies' },
  { min: 0.5, label: 'Weak evidence',       colour: '#A07860', desc: 'Π 0.5–1.0 — anecdotal, minimal research' },
  { min: 0,   label: 'Speculative',         colour: '#8060A0', desc: 'Π < 0.5 — traditional or theoretical only' },
]

function getPiBand(pi) {
  return PI_BANDS.find(b => pi >= b.min) || PI_BANDS[PI_BANDS.length - 1]
}

function EvidencePanel({ subjects, progress, phaseColour }) {
  const [sortBy, setSortBy] = useState('pi_desc')
  const [filterBand, setFilterBand] = useState(null)

  const studiedSubjects = useMemo(() => {
    return subjects.filter(s => progress[s.id]?.mastery >= 1 || progress[s.id]?.status === 'completed')
  }, [subjects, progress])

  const sorted = useMemo(() => {
    let list = filterBand !== null
      ? studiedSubjects.filter(s => getPiBand(s.pi || 0).min === filterBand)
      : studiedSubjects
    if (sortBy === 'pi_desc') return [...list].sort((a, b) => (b.pi || 0) - (a.pi || 0))
    if (sortBy === 'pi_asc')  return [...list].sort((a, b) => (a.pi || 0) - (b.pi || 0))
    if (sortBy === 'alpha')   return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [studiedSubjects, sortBy, filterBand])

  if (studiedSubjects.length === 0) {
    return (
      <div className="evidence-empty">
        <div className="evidence-empty-glyph font-mono" style={{ color: phaseColour }}>Π</div>
        <p>Complete or begin subjects to see their evidence ratings here.</p>
        <p className="text-dim">Π scores measure how evidence-gated each subject is — from rigorous science to traditional knowledge.</p>
      </div>
    )
  }

  return (
    <div className="evidence-panel">
      <div className="evidence-legend">
        {PI_BANDS.map(band => (
          <button
            key={band.min}
            className={`evidence-band-chip ${filterBand === band.min ? 'evidence-band-chip--active' : ''}`}
            style={filterBand === band.min ? { borderColor: band.colour, color: band.colour } : {}}
            onClick={() => setFilterBand(filterBand === band.min ? null : band.min)}
            title={band.desc}
          >
            <span className="evidence-band-dot" style={{ background: band.colour }} />
            {band.label}
          </button>
        ))}
      </div>

      <div className="evidence-controls">
        <div className="evidence-count text-dim">
          {sorted.length} subject{sorted.length !== 1 ? 's' : ''} studied
        </div>
        <div className="evidence-sort text-dim">
          Sort:&nbsp;
          {[
            { id: 'pi_desc', label: 'Π↓' },
            { id: 'pi_asc',  label: 'Π↑' },
            { id: 'alpha',   label: 'A–Z' },
          ].map(s => (
            <button
              key={s.id}
              className={`evidence-sort-btn ${sortBy === s.id ? 'evidence-sort-btn--active' : ''}`}
              style={sortBy === s.id ? { color: phaseColour } : {}}
              onClick={() => setSortBy(s.id)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="evidence-list">
        {sorted.map(s => {
          const band = getPiBand(s.pi || 0)
          return (
            <div key={s.id} className="evidence-row">
              <div className="evidence-row-left">
                <span className="evidence-pi font-mono" style={{ color: band.colour }}>Π{s.pi?.toFixed(1) || '?'}</span>
                <div className="evidence-subject-info">
                  <div className="evidence-subject-name">{s.name}</div>
                  <div className="evidence-subject-domain text-dim">{s.domain}</div>
                </div>
              </div>
              <div className="evidence-band-label text-dim" style={{ color: band.colour }}>{band.label}</div>
            </div>
          )
        })}
      </div>

      <div className="evidence-footer text-dim">
        Π (Pi) = Truth Pressure score. Measures evidential weight, not moral worth. Low-Π subjects can be transformative — they simply carry less empirical validation.
      </div>
    </div>
  )
}

// ─── Somatic Heat Map ─────────────────────────────────────────────────────────

const SOMATIC_REGIONS = [
  { id: 'head',         label: 'Head',         cx: 100, cy: 42,  r: 18 },
  { id: 'throat',       label: 'Throat',       cx: 100, cy: 72,  r: 10 },
  { id: 'heart',        label: 'Heart',        cx: 100, cy: 100, r: 14 },
  { id: 'solar_plexus', label: 'Solar Plexus', cx: 100, cy: 125, r: 12 },
  { id: 'belly',        label: 'Belly',        cx: 100, cy: 150, r: 13 },
  { id: 'hips',         label: 'Hips',         cx: 100, cy: 175, r: 15 },
  { id: 'left_hand',    label: 'Left Hand',    cx: 58,  cy: 120, r: 10 },
  { id: 'right_hand',   label: 'Right Hand',   cx: 142, cy: 120, r: 10 },
  { id: 'feet',         label: 'Feet',         cx: 100, cy: 215, r: 14 },
]

function SomaticHeatMap({ practiceLog, phaseColour }) {
  const sessions = useMemo(() => (practiceLog || []).filter(s => s.somaticScore?.length > 0), [practiceLog])

  const heatMap = useMemo(() => {
    const counts = {}
    sessions.forEach(s => {
      s.somaticScore.forEach(r => {
        if (r.id !== 'field') counts[r.id] = (counts[r.id] || 0) + 1
      })
    })
    return counts
  }, [sessions])

  const maxCount = Math.max(1, ...Object.values(heatMap))

  const qualityMap = useMemo(() => {
    const q = {}
    sessions.forEach(s => {
      s.somaticScore.forEach(r => {
        if (r.quality && r.id !== 'field') {
          if (!q[r.id]) q[r.id] = {}
          q[r.id][r.quality] = (q[r.id][r.quality] || 0) + 1
        }
      })
    })
    return q
  }, [sessions])

  if (sessions.length === 0) {
    return (
      <div className="somatic-empty">
        <p className="text-dim" style={{ textAlign: 'center', padding: '3rem 1rem', fontStyle: 'italic' }}>
          No somatic maps yet. Complete a practice session to begin tracking where you feel the work.
        </p>
      </div>
    )
  }

  return (
    <div className="somatic-heatmap">
      <div className="somatic-heatmap-header">
        <span className="somatic-heatmap-title">Somatic Pattern Map</span>
        <span className="text-dim" style={{ fontSize: '0.8rem' }}>{sessions.length} mapped sessions</span>
      </div>

      <div className="somatic-heatmap-body">
        <svg className="somatic-svg" viewBox="0 0 200 260">
          {/* Body outline */}
          <ellipse cx="100" cy="42" rx="17" ry="18" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="78" y="60" width="44" height="70" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="55" y="65" width="22" height="55" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="123" y="65" width="22" height="55" rx="8" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="82" y="130" width="16" height="60" rx="6" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="102" y="130" width="16" height="60" rx="6" fill="none" stroke="var(--border)" strokeWidth="1.5" />

          {SOMATIC_REGIONS.map(r => {
            const count = heatMap[r.id] || 0
            const intensity = count / maxCount
            return (
              <circle
                key={r.id}
                cx={r.cx} cy={r.cy} r={r.r}
                fill={count > 0 ? `rgba(201, 168, 76, ${0.1 + intensity * 0.7})` : 'rgba(201, 168, 76, 0.04)'}
                stroke={count > 0 ? 'var(--accent, #C9A84C)' : 'var(--border)'}
                strokeWidth={count > 0 ? 1.5 : 1}
              />
            )
          })}
        </svg>

        <div className="somatic-legend">
          {SOMATIC_REGIONS.map(r => {
            const count = heatMap[r.id] || 0
            if (count === 0) return null
            const topQuality = qualityMap[r.id]
              ? Object.entries(qualityMap[r.id]).sort((a, b) => b[1] - a[1])[0]?.[0]
              : null
            return (
              <div key={r.id} className="somatic-legend-row">
                <span className="somatic-legend-label">{r.label}</span>
                <span className="somatic-legend-count" style={{ color: phaseColour }}>{count}×</span>
                {topQuality && <span className="somatic-legend-quality text-dim">{topQuality}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
