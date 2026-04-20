import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { PHASE_COLOURS } from '../../theme/colours'
import { KEYS } from '../../data/schema'
import { strikeBowl, ringIntervalBell, playInhaleTone, playExhaleTone, playHoldTone, startShadowDrone } from '../../engine/sound'
import BodyMap from '../components/BodyMap'
import './PracticeView.css'

// ─── Session logger ────────────────────────────────────────────────────────────

async function logSession({ type, practiceId, durationSeconds, phase, depth }) {
  const session = {
    id: Date.now().toString(36),
    practiceId,
    type,
    duration: durationSeconds,
    completedAt: new Date().toISOString(),
    phase: phase || 1,
    depth: depth || 1,
  }

  // Append to practice log
  const existing = await getStoreValue(KEYS.PRACTICE_LOG) || []
  await setStoreValue(KEYS.PRACTICE_LOG, [...existing, session])
  return session.id

  // Update streaks
  const streaks = await getStoreValue(KEYS.STREAKS) || {
    current: 0, longest: 0, lastPracticeDate: null, totalSessions: 0, totalMinutes: 0,
  }
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  if (streaks.lastPracticeDate === today) {
    // already practiced today — just add minutes
  } else if (streaks.lastPracticeDate === yesterday) {
    streaks.current += 1
  } else {
    streaks.current = 1
  }
  streaks.longest = Math.max(streaks.longest, streaks.current)
  streaks.lastPracticeDate = today
  streaks.totalSessions += 1
  streaks.totalMinutes += Math.floor(durationSeconds / 60)

  await setStoreValue(KEYS.STREAKS, streaks)
}

// ─── Practice definitions ──────────────────────────────────────────────────────

const PRACTICES = [
  {
    id: 'box_breathing',
    name: 'Box Breathing',
    glyph: '□',
    domain: 'Breathwork',
    desc: 'Four equal sides. Equal inhale, hold, exhale, hold. Regulates the nervous system within minutes.',
    duration: 4,    // minutes
    phases: [
      { label: 'Inhale',    seconds: 4, colour: null },
      { label: 'Hold',      seconds: 4, colour: null },
      { label: 'Exhale',    seconds: 4, colour: null },
      { label: 'Hold',      seconds: 4, colour: null },
    ],
    type: 'breathwork',
  },
  {
    id: 'wim_hof',
    name: 'Wim Hof Breathing',
    glyph: '≋',
    domain: 'Breathwork',
    desc: '30 power breaths, retention, recovery. Activates the sympathetic system, then deep rest.',
    duration: 10,
    phases: [
      { label: 'Power Breath', seconds: 2,  colour: null },
      { label: 'Power Breath', seconds: 2,  colour: null },
      { label: 'Retain',       seconds: 60, colour: null },
      { label: 'Recovery',     seconds: 15, colour: null },
    ],
    type: 'breathwork',
    note: 'Do not practise near water, while driving, or standing. Dizziness is normal in first rounds.',
  },
  {
    id: '478_breathing',
    name: '4-7-8 Breathing',
    glyph: '∿',
    domain: 'Breathwork',
    desc: 'Andrew Weil\'s sleep and anxiety protocol. Extends the exhale to activate parasympathetic tone.',
    duration: 5,
    phases: [
      { label: 'Inhale',    seconds: 4,  colour: null },
      { label: 'Hold',      seconds: 7,  colour: null },
      { label: 'Exhale',    seconds: 8,  colour: null },
    ],
    type: 'breathwork',
  },
  {
    id: 'shamatha_timer',
    name: 'Shamatha Sit',
    glyph: '●',
    domain: 'Meditation',
    desc: 'Timed calm abiding. Attention on the breath. When it wanders, return without judgement. The return IS the practice.',
    duration: 20,
    type: 'meditation',
    isFreeform: true,
  },
  {
    id: 'open_awareness',
    name: 'Open Awareness',
    glyph: '○',
    domain: 'Meditation',
    desc: 'Let attention expand to the whole field. Nothing to focus on. Just the sky, not the clouds.',
    duration: 15,
    type: 'meditation',
    isFreeform: true,
  },
  {
    id: 'body_scan',
    name: 'Body Scan',
    glyph: '◎',
    domain: 'Meditation',
    desc: 'Slow systematic attention through the body. Notice sensation without trying to change it.',
    duration: 20,
    type: 'meditation',
    isFreeform: true,
  },
  {
    id: 'contemplation',
    name: 'Contemplation Timer',
    glyph: '◈',
    domain: 'Meditation',
    desc: 'Fix one question. Sit with it. Not to answer — to let it deepen. The question is the practice, not the answer.',
    duration: 20,
    type: 'contemplation',
    isFreeform: true,
    contemplationPrompts: [
      'What is the nature of consciousness?',
      'Who am I beneath every role I play?',
      'What does it mean to know something?',
      'What is the relationship between observer and observed?',
      'What remains when all thought ceases?',
      'What is the source of meaning?',
      'What would I do if I could not fail and no one would know?',
    ],
  },
  {
    id: 'walking_meditation',
    name: 'Walking Meditation',
    glyph: '⟲',
    domain: 'Movement',
    desc: 'Slow deliberate steps. Each foot fall conscious. Movement becomes stillness in motion. 20 minutes minimum.',
    duration: 20,
    type: 'walking',
    phases: [
      { label: 'Step', seconds: 1, colour: null },
    ],
  },
  {
    id: 'shadow_mirror',
    name: 'Shadow Mirror',
    glyph: '⊗',
    domain: 'Shadow Work',
    desc: 'Name what triggers you. Own the projection. Reclaim the energy locked inside it.',
    duration: 30,
    type: 'shadow',
    prompts: [
      'Who triggered you most recently? What quality in them bothers you most?',
      'That quality exists in you. Where? In what form? When does it appear?',
      'What would it look like to own that quality — to use it consciously rather than suppress it?',
      'What would you lose if you no longer needed to project this onto others?',
      'Write one sentence reclaiming this as yours.',
    ],
  },
  {
    id: 'nigredo_sit',
    name: 'Nigredo Inquiry',
    glyph: '⬛',
    domain: 'Shadow Work',
    desc: 'Sit with what is burning. Do not fix it. Do not explain it. Just be present with it.',
    duration: 20,
    type: 'shadow',
    prompts: [
      'What is the thing you most don\'t want to look at right now?',
      'Where do you feel it in your body? Describe the sensation precisely.',
      'If this feeling had a colour, shape, and weight — what would they be?',
      'What is it protecting? What would be exposed if it dissolved?',
      'You don\'t have to resolve this. Just let it be seen.',
    ],
  },
]

const DOMAINS = ['All', 'Breathwork', 'Meditation', 'Shadow Work', 'Movement']

const SHADOW_STAGES = [
  { index: 0, name: 'Recognition',   glyph: '◯', threshold: 0,  desc: 'First contact with the shadow. Becoming aware that something is there.' },
  { index: 1, name: 'Witnessing',    glyph: '◔', threshold: 2,  desc: 'Staying with what you see without flinching. Presence before change.' },
  { index: 2, name: 'Confrontation', glyph: '◑', threshold: 5,  desc: 'Meeting the pattern directly. Named, seen, not turned away from.' },
  { index: 3, name: 'Reclamation',   glyph: '◕', threshold: 9,  desc: 'Claiming the energy locked inside the shadow as your own.' },
  { index: 4, name: 'Integration',   glyph: '⊙', threshold: 14, desc: 'The shadow is no longer other. It is you, made conscious.' },
  { index: 5, name: 'Embodiment',    glyph: '●', threshold: 20, desc: 'Living from wholeness. The wound became the gift.' },
]

function getShadowStage(count) {
  let stage = SHADOW_STAGES[0]
  for (const s of SHADOW_STAGES) {
    if (count >= s.threshold) stage = s
  }
  return stage
}

export default function PracticeView() {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8B7ACC'

  const [domainFilter, setDomainFilter] = useState('All')
  const [active, setActive] = useState(null)       // practice id currently open
  const [customBreathwork, setCustomBreathwork] = useState([])
  const [building, setBuilding] = useState(false)  // showing custom builder
  const [shadowCount, setShadowCount] = useState(0)
  const [somaticSession, setSomaticSession] = useState(null) // { sessionId, practiceType }

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.CUSTOM_BREATHWORK),
      getStoreValue(KEYS.PRACTICE_LOG),
    ]).then(([cb, log]) => {
      setCustomBreathwork(cb || [])
      const count = (log || []).filter(s => s.type === 'shadow_work').length
      setShadowCount(count)
    })
  }, [])

  const allPractices = [...PRACTICES, ...customBreathwork]
  const filtered = allPractices.filter(p =>
    domainFilter === 'All' || p.domain === domainFilter
  )

  const activePractice = allPractices.find(p => p.id === active)

  async function saveCustomPattern(pattern) {
    const updated = [...customBreathwork, pattern]
    setCustomBreathwork(updated)
    await setStoreValue(KEYS.CUSTOM_BREATHWORK, updated)
    setBuilding(false)
    setActive(pattern.id)
  }

  async function deleteCustomPattern(id) {
    const updated = customBreathwork.filter(p => p.id !== id)
    setCustomBreathwork(updated)
    await setStoreValue(KEYS.CUSTOM_BREATHWORK, updated)
    if (active === id) setActive(null)
  }

  return (
    <div className="practice-layout">
      {/* Sidebar */}
      <div className="practice-sidebar">
        <div className="practice-sidebar-header">
          <span className="font-mono practice-header-glyph" style={{ color: phaseColour }}>Ψ</span>
          <div>
            <h2 className="font-serif practice-title">Practice</h2>
            <div className="text-dim practice-subtitle">Tools for the work</div>
          </div>
        </div>

        <div className="practice-domain-filters">
          {DOMAINS.map(d => (
            <button
              key={d}
              className={`filter-chip ${domainFilter === d ? 'filter-chip--active' : ''}`}
              onClick={() => setDomainFilter(d)}
            >{d}</button>
          ))}
        </div>

        {/* Shadow stage panel */}
        {(domainFilter === 'Shadow Work') && (() => {
          const stage = getShadowStage(shadowCount)
          const nextStage = SHADOW_STAGES[stage.index + 1]
          return (
            <div className="shadow-stage-panel">
              <div className="shadow-stage-header">
                <span className="shadow-stage-glyph font-mono" style={{ color: phaseColour }}>{stage.glyph}</span>
                <div>
                  <div className="shadow-stage-name">{stage.name}</div>
                  <div className="shadow-stage-count text-dim">Stage {stage.index + 1} of 6 · {shadowCount} session{shadowCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <p className="shadow-stage-desc text-dim">{stage.desc}</p>
              {nextStage && (
                <div className="shadow-stage-next text-dim">
                  Next: {nextStage.name} at {nextStage.threshold} sessions
                </div>
              )}
              <div className="shadow-stage-pips">
                {SHADOW_STAGES.map(s => (
                  <div
                    key={s.index}
                    className="shadow-stage-pip"
                    style={{ background: shadowCount >= s.threshold ? phaseColour : 'var(--border)' }}
                    title={s.name}
                  />
                ))}
              </div>
            </div>
          )
        })()}

        <div className="practice-list">
          {filtered.map(p => (
            <div key={p.id} className="practice-item-wrap">
              <button
                className={`practice-item ${(active === p.id && !building) ? 'practice-item--active' : ''}`}
                onClick={() => { setActive(p.id); setBuilding(false) }}
              >
                <span className="practice-item-glyph font-mono" style={{ color: phaseColour }}>{p.glyph}</span>
                <div className="practice-item-info">
                  <div className="practice-item-name">{p.name}</div>
                  <div className="practice-item-meta text-dim">{p.domain} · {p.isCustom ? 'custom' : `${p.duration} min`}</div>
                </div>
              </button>
              {p.isCustom && (
                <button
                  className="practice-item-delete"
                  onClick={e => { e.stopPropagation(); deleteCustomPattern(p.id) }}
                  title="Delete custom pattern"
                >×</button>
              )}
            </div>
          ))}

          {(domainFilter === 'All' || domainFilter === 'Breathwork') && (
            <button
              className={`practice-item practice-item--create ${building ? 'practice-item--active' : ''}`}
              onClick={() => { setBuilding(true); setActive(null) }}
            >
              <span className="practice-item-glyph font-mono" style={{ color: phaseColour }}>⊕</span>
              <div className="practice-item-info">
                <div className="practice-item-name">Custom Pattern</div>
                <div className="practice-item-meta text-dim">Build your own breathwork</div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="practice-main">
        {!activePractice && !building && <PracticeEmpty phaseColour={phaseColour} />}
        {building && (
          <BreathworkBuilder
            phaseColour={phaseColour}
            onSave={saveCustomPattern}
            onCancel={() => setBuilding(false)}
          />
        )}
        {!building && activePractice?.type === 'breathwork' && (
          <BreathworkTimer practice={activePractice} phaseColour={phaseColour} phase={phase} depth={state?.coordinates?.depth || 1} onSessionComplete={(id, type) => setSomaticSession({ sessionId: id, practiceType: type })} />
        )}
        {!building && activePractice?.type === 'meditation' && (
          <MeditationTimer practice={activePractice} phaseColour={phaseColour} phase={phase} depth={state?.coordinates?.depth || 1} onSessionComplete={(id, type) => setSomaticSession({ sessionId: id, practiceType: type })} />
        )}
        {!building && activePractice?.type === 'contemplation' && (
          <ContemplationTimer practice={activePractice} phaseColour={phaseColour} phase={phase} depth={state?.coordinates?.depth || 1} onSessionComplete={(id, type) => setSomaticSession({ sessionId: id, practiceType: type })} />
        )}
        {!building && activePractice?.type === 'walking' && (
          <WalkingMeditation practice={activePractice} phaseColour={phaseColour} phase={phase} depth={state?.coordinates?.depth || 1} onSessionComplete={(id, type) => setSomaticSession({ sessionId: id, practiceType: type })} />
        )}
        {!building && activePractice?.type === 'shadow' && (
          <ShadowPrompts
            practice={activePractice}
            phaseColour={phaseColour}
            phase={phase}
            depth={state?.coordinates?.depth || 1}
            onComplete={async () => {
              const id = await logSession({ type: 'shadow_work', practiceId: activePractice?.id, durationSeconds: activePractice?.duration * 60 || 0, phase, depth: state?.coordinates?.depth || 1 })
              setShadowCount(c => c + 1)
              setSomaticSession({ sessionId: id, practiceType: 'shadow_work' })
            }}
          />
        )}
      </div>

      {/* Somatic Scoring Modal */}
      {somaticSession && (
        <BodyMap
          practiceType={somaticSession.practiceType}
          onSave={async (regions) => {
            if (regions.length > 0) {
              const log = await getStoreValue(KEYS.PRACTICE_LOG) || []
              const updated = log.map(entry =>
                entry.id === somaticSession.sessionId
                  ? { ...entry, somaticScore: regions }
                  : entry
              )
              await setStoreValue(KEYS.PRACTICE_LOG, updated)
            }
            setSomaticSession(null)
          }}
          onSkip={() => setSomaticSession(null)}
        />
      )}
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function PracticeEmpty({ phaseColour }) {
  return (
    <div className="practice-empty">
      <span className="font-mono practice-empty-glyph" style={{ color: phaseColour }}>Ψ</span>
      <h2 className="font-serif">The Laboratory</h2>
      <p className="text-dim">
        The school without practice is just reading.<br />
        Select a tool to begin the actual work.
      </p>
    </div>
  )
}

// ─── Breathwork Builder ────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Box', phases: [4, 4, 4, 4] },
  { label: '4-7-8', phases: [4, 7, 8, 0] },
  { label: 'Wim Hof', phases: [2, 0, 2, 0] },
  { label: 'Buteyko', phases: [3, 0, 5, 2] },
  { label: 'Coherence', phases: [5, 0, 5, 0] },
]

function BreathworkBuilder({ phaseColour, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [inhale, setInhale] = useState(4)
  const [holdIn, setHoldIn] = useState(4)
  const [exhale, setExhale] = useState(4)
  const [holdOut, setHoldOut] = useState(4)

  const phases = useMemo(() => {
    const p = []
    p.push({ label: 'Inhale', seconds: inhale })
    if (holdIn > 0) p.push({ label: 'Hold', seconds: holdIn })
    p.push({ label: 'Exhale', seconds: exhale })
    if (holdOut > 0) p.push({ label: 'Hold', seconds: holdOut })
    return p
  }, [inhale, holdIn, exhale, holdOut])

  const cycleSeconds = inhale + holdIn + exhale + holdOut
  const ratio = `${inhale}:${holdIn}:${exhale}:${holdOut}`

  function applyPreset(preset) {
    setInhale(preset.phases[0])
    setHoldIn(preset.phases[1])
    setExhale(preset.phases[2])
    setHoldOut(preset.phases[3])
  }

  function handleSave() {
    if (!name.trim() || inhale < 1 || exhale < 1) return
    const pattern = {
      id: 'custom_bw_' + Date.now(),
      name: name.trim(),
      glyph: '◇',
      domain: 'Breathwork',
      desc: `Custom pattern: ${ratio}. ${cycleSeconds}s per cycle.`,
      duration: 10,
      phases,
      type: 'breathwork',
      isCustom: true,
    }
    onSave(pattern)
  }

  const SliderField = ({ label, value, setValue, min = 0, max = 15 }) => (
    <div className="bwb-field">
      <div className="bwb-field-row">
        <label className="bwb-label text-dim">{label}</label>
        <span className="bwb-value font-mono" style={{ color: phaseColour }}>{value}s</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="bwb-slider"
      />
    </div>
  )

  return (
    <div className="bwb-wrap">
      <div className="breathwork-header">
        <span className="breathwork-glyph font-mono" style={{ color: phaseColour }}>◇</span>
        <div>
          <div className="breathwork-title font-serif">Custom Breathwork</div>
          <div className="breathwork-desc text-dim">Set your own inhale / hold / exhale / hold durations.</div>
        </div>
      </div>

      {/* Presets */}
      <div className="bwb-presets">
        <div className="bwb-presets-label text-dim font-mono">Presets</div>
        <div className="bwb-preset-btns">
          {PRESETS.map(p => (
            <button
              key={p.label}
              className="bwb-preset-btn"
              onClick={() => applyPreset(p)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="bwb-field">
        <label className="bwb-label text-dim">Pattern Name</label>
        <input
          className="bwb-name-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My Pattern"
          maxLength={40}
        />
      </div>

      {/* Phase sliders */}
      <SliderField label="Inhale" value={inhale} setValue={setInhale} min={1} max={15} />
      <SliderField label="Hold (after inhale)" value={holdIn} setValue={setHoldIn} min={0} max={15} />
      <SliderField label="Exhale" value={exhale} setValue={setExhale} min={1} max={15} />
      <SliderField label="Hold (after exhale)" value={holdOut} setValue={setHoldOut} min={0} max={15} />

      {/* Ratio preview */}
      <div className="bwb-ratio-preview">
        <div className="bwb-ratio-label text-dim font-mono">Pattern</div>
        <div className="bwb-ratio-bars">
          {[
            { label: 'Inhale', sec: inhale, colour: '#7C9AB8' },
            { label: 'Hold', sec: holdIn, colour: '#8B7ACC' },
            { label: 'Exhale', sec: exhale, colour: '#6BAA80' },
            { label: 'Hold', sec: holdOut, colour: '#8B7ACC' },
          ].filter(p => p.sec > 0).map((p, i) => (
            <div key={i} className="bwb-ratio-segment" style={{ flex: p.sec }}>
              <div className="bwb-ratio-bar" style={{ background: p.colour }} />
              <div className="bwb-ratio-seg-label text-dim" style={{ color: p.colour }}>{p.label} {p.sec}s</div>
            </div>
          ))}
        </div>
        <div className="text-dim bwb-cycle-info">{cycleSeconds}s per cycle · ratio {ratio}</div>
      </div>

      <div className="bwb-actions">
        <button
          className="btn-primary"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={handleSave}
          disabled={!name.trim() || inhale < 1 || exhale < 1}
        >
          Save Pattern
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ─── Breathwork timer ──────────────────────────────────────────────────────────

function BreathworkTimer({ practice, phaseColour, phase, depth, onSessionComplete }) {
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)
  const totalSeconds = practice.duration * 60
  const [totalElapsed, setTotalElapsed] = useState(0)

  const currentPhase = practice.phases[phaseIdx]
  const phaseDur = currentPhase?.seconds || 4
  const progress = elapsed / phaseDur

  // Fire breath tone when phase changes or practice starts
  useEffect(() => {
    if (!running) return
    const label = practice.phases[phaseIdx]?.label || ''
    const dur = practice.phases[phaseIdx]?.seconds || 4
    if (label === 'Inhale') playInhaleTone(dur)
    else if (label === 'Exhale') playExhaleTone(dur)
    else playHoldTone(dur)  // Hold, Retain, Recovery, Power Breath
  }, [phaseIdx, running])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        if (next >= phaseDur) {
          // advance phase
          setPhaseIdx(pi => {
            const nextPi = (pi + 1) % practice.phases.length
            if (nextPi === 0) setCycles(c => c + 1)
            return nextPi
          })
          return 0
        }
        return next
      })
      setTotalElapsed(t => {
        const next = t + 1
        if (next >= totalSeconds) {
          clearInterval(timerRef.current)
          setRunning(false)
          setDone(true)
          strikeBowl(0.5)
          logSession({ type: 'breathwork', practiceId: practice.id, durationSeconds: next, phase, depth }).then(id => onSessionComplete?.(id, 'breathwork'))
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, phaseDur, totalSeconds])

  function reset() {
    clearInterval(timerRef.current)
    setRunning(false)
    setPhaseIdx(0)
    setElapsed(0)
    setCycles(0)
    setTotalElapsed(0)
    setDone(false)
  }

  const circumference = 2 * Math.PI * 80
  const strokeDash = circumference - (progress * circumference)
  const overallPct = totalElapsed / totalSeconds

  return (
    <div className="breathwork-view">
      <div className="breathwork-header">
        <span className="font-mono breathwork-glyph" style={{ color: phaseColour }}>{practice.glyph}</span>
        <div>
          <h2 className="font-serif breathwork-title">{practice.name}</h2>
          <p className="text-dim breathwork-desc">{practice.desc}</p>
        </div>
      </div>

      {practice.note && (
        <div className="practice-warning">⚠️ {practice.note}</div>
      )}

      {/* Main circle */}
      <div className="breathwork-circle-wrap">
        <svg className="breathwork-svg" viewBox="0 0 200 200">
          {/* Background track */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="3" />
          {/* Phase progress */}
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={phaseColour}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          {/* Overall progress ring */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--card)" strokeWidth="2" />
          <circle
            cx="100" cy="100" r="70"
            fill="none"
            stroke={phaseColour}
            strokeWidth="2"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * (1 - overallPct)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            opacity="0.3"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          {/* Phase label */}
          <text x="100" y="92" textAnchor="middle" fill="var(--text-bright)" fontSize="14" fontFamily="Georgia, serif">
            {done ? 'Complete' : (running ? currentPhase?.label : 'Ready')}
          </text>
          {/* Countdown */}
          <text x="100" y="118" textAnchor="middle" fill={phaseColour} fontSize="28" fontFamily="'Courier New', monospace" fontWeight="bold">
            {done ? '✓' : (running ? phaseDur - elapsed : phaseDur)}
          </text>
          {/* Cycles */}
          {cycles > 0 && (
            <text x="100" y="140" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily="'Courier New', monospace">
              cycle {cycles}
            </text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="breathwork-controls">
        {!done ? (
          <>
            <button
              className="btn-primary breathwork-btn"
              style={{ background: phaseColour, borderColor: phaseColour }}
              onClick={() => setRunning(r => !r)}
            >
              {running ? 'Pause' : (totalElapsed > 0 ? 'Resume' : 'Begin')}
            </button>
            {totalElapsed > 0 && (
              <button className="btn-ghost" onClick={reset}>Reset</button>
            )}
          </>
        ) : (
          <div className="practice-complete-card">
            <div className="practice-complete-glyph" style={{ color: phaseColour }}>✓</div>
            <div className="font-serif practice-complete-text">
              {Math.floor(totalElapsed / 60)} minutes. {cycles} cycles complete.
            </div>
            <button className="btn-ghost" onClick={reset}>Again</button>
          </div>
        )}
      </div>

      <div className="breathwork-time text-dim font-mono">
        {Math.floor(totalElapsed / 60)}:{String(totalElapsed % 60).padStart(2, '0')} / {practice.duration}:00
      </div>
    </div>
  )
}

// ─── Meditation timer ──────────────────────────────────────────────────────────

function MeditationTimer({ practice, phaseColour, phase, depth, onSessionComplete }) {
  const [minutes, setMinutes] = useState(practice.duration)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(practice.duration * 60)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  const total = minutes * 60
  const progress = 1 - (remaining / total)

  useEffect(() => {
    setRemaining(minutes * 60)
    setDone(false)
  }, [minutes])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          setDone(true)
          ringIntervalBell(0.5)
          logSession({ type: 'meditation', practiceId: practice.id, durationSeconds: total, phase, depth }).then(id => onSessionComplete?.(id, 'meditation'))
          return 0
        }
        // Interval bell every 5 minutes (not at session end)
        if (r % 300 === 0) ringIntervalBell(0.25)
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  function reset() {
    clearInterval(timerRef.current)
    setRunning(false)
    setRemaining(minutes * 60)
    setDone(false)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const circumference = 2 * Math.PI * 80

  return (
    <div className="breathwork-view">
      <div className="breathwork-header">
        <span className="font-mono breathwork-glyph" style={{ color: phaseColour }}>{practice.glyph}</span>
        <div>
          <h2 className="font-serif breathwork-title">{practice.name}</h2>
          <p className="text-dim breathwork-desc">{practice.desc}</p>
        </div>
      </div>

      {/* Duration selector */}
      {!running && !done && (
        <div className="meditation-duration">
          <div className="text-dim meditation-dur-label font-mono">Duration</div>
          <div className="meditation-dur-options">
            {[5, 10, 15, 20, 30, 45, 60].map(m => (
              <button
                key={m}
                className={`meditation-dur-btn ${minutes === m ? 'meditation-dur-btn--active' : ''}`}
                style={minutes === m ? { borderColor: phaseColour, color: phaseColour } : {}}
                onClick={() => setMinutes(m)}
              >{m}m</button>
            ))}
          </div>
        </div>
      )}

      {/* Circle */}
      <div className="breathwork-circle-wrap">
        <svg className="breathwork-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={phaseColour}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          <text x="100" y="105" textAnchor="middle" fill={done ? phaseColour : 'var(--text-bright)'}
            fontSize={done ? '32' : '36'} fontFamily="'Courier New', monospace" fontWeight="bold">
            {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
          {done && (
            <text x="100" y="130" textAnchor="middle" fill="var(--text-dim)" fontSize="12" fontFamily="Georgia, serif">
              session complete
            </text>
          )}
        </svg>
      </div>

      <div className="breathwork-controls">
        {!done ? (
          <>
            <button
              className="btn-primary breathwork-btn"
              style={{ background: phaseColour, borderColor: phaseColour }}
              onClick={() => {
                if (!running && remaining === total) strikeBowl(0.4)
                setRunning(r => !r)
              }}
            >
              {running ? 'Pause' : (remaining < total ? 'Resume' : 'Begin')}
            </button>
            {remaining < total && (
              <button className="btn-ghost" onClick={reset}>Reset</button>
            )}
          </>
        ) : (
          <div className="practice-complete-card">
            <div className="font-serif practice-complete-text">{minutes} minutes. Sit complete.</div>
            <button className="btn-ghost" onClick={reset}>Sit again</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Contemplation Timer ──────────────────────────────────────────────────────
// One question. Fixed. Timed sit. Bell at end.

function ContemplationTimer({ practice, phaseColour, phase, depth, onSessionComplete }) {
  const [minutes, setMinutes] = useState(practice.duration)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(practice.duration * 60)
  const [done, setDone] = useState(false)
  const [questionIdx, setQuestionIdx] = useState(0)
  const timerRef = useRef(null)

  const total = minutes * 60
  const progress = 1 - (remaining / total)
  const question = practice.contemplationPrompts[questionIdx]

  useEffect(() => {
    setRemaining(minutes * 60)
    setDone(false)
  }, [minutes])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          setDone(true)
          strikeBowl(0.6)
          logSession({ type: 'contemplation', practiceId: practice.id, durationSeconds: total, phase, depth }).then(id => onSessionComplete?.(id, 'contemplation'))
          return 0
        }
        if (r % 300 === 0) ringIntervalBell(0.2)
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  function reset() {
    clearInterval(timerRef.current)
    setRunning(false)
    setRemaining(minutes * 60)
    setDone(false)
  }

  function nextQuestion() {
    setQuestionIdx(i => (i + 1) % practice.contemplationPrompts.length)
    reset()
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const circumference = 2 * Math.PI * 80

  return (
    <div className="breathwork-view">
      <div className="breathwork-header">
        <span className="font-mono breathwork-glyph" style={{ color: phaseColour }}>{practice.glyph}</span>
        <div>
          <h2 className="font-serif breathwork-title">{practice.name}</h2>
          <p className="text-dim breathwork-desc">{practice.desc}</p>
        </div>
      </div>

      {/* The question */}
      <div className="contemplation-question-block" style={{ borderLeftColor: phaseColour }}>
        <div className="contemplation-question-label text-dim font-mono">Sit with this</div>
        <p className="contemplation-question font-serif">{question}</p>
        {!running && !done && (
          <button className="contemplation-rotate text-dim" onClick={nextQuestion}>
            different question →
          </button>
        )}
      </div>

      {/* Duration */}
      {!running && !done && (
        <div className="meditation-duration">
          <div className="text-dim meditation-dur-label font-mono">Duration</div>
          <div className="meditation-dur-options">
            {[10, 20, 30, 45, 60].map(m => (
              <button
                key={m}
                className={`meditation-dur-btn ${minutes === m ? 'meditation-dur-btn--active' : ''}`}
                style={minutes === m ? { borderColor: phaseColour, color: phaseColour } : {}}
                onClick={() => setMinutes(m)}
              >{m}m</button>
            ))}
          </div>
        </div>
      )}

      {/* Circle */}
      <div className="breathwork-circle-wrap">
        <svg className="breathwork-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="100" cy="100" r="80"
            fill="none" stroke={phaseColour} strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          <text x="100" y="105" textAnchor="middle"
            fill={done ? phaseColour : 'var(--text-bright)'}
            fontSize={done ? '28' : '32'} fontFamily="'Courier New', monospace" fontWeight="bold">
            {done ? '◈' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
          {done && (
            <text x="100" y="128" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily="Georgia, serif">
              return slowly
            </text>
          )}
        </svg>
      </div>

      <div className="breathwork-controls">
        {!done ? (
          <>
            <button
              className="btn-primary breathwork-btn"
              style={{ background: phaseColour, borderColor: phaseColour }}
              onClick={() => {
                if (!running && remaining === total) strikeBowl(0.35)
                setRunning(r => !r)
              }}
            >
              {running ? 'Pause' : (remaining < total ? 'Resume' : 'Enter')}
            </button>
            {remaining < total && <button className="btn-ghost" onClick={reset}>Reset</button>}
          </>
        ) : (
          <div className="practice-complete-card">
            <div className="font-serif practice-complete-text">{minutes} minutes of inquiry.</div>
            <button className="btn-ghost" onClick={nextQuestion}>New question</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Walking Meditation ────────────────────────────────────────────────────────
// Paced rhythm cues — step awareness at configurable pace

const WALK_PACES = [
  { label: 'Very slow', stepsPerMin: 20, desc: 'One breath per step' },
  { label: 'Slow',      stepsPerMin: 40, desc: 'Gentle, deliberate' },
  { label: 'Mindful',   stepsPerMin: 60, desc: 'Natural but aware' },
]

const WALK_CUES = [
  'Feel the heel make contact.',
  'Feel the weight shift forward.',
  'Feel the ball of the foot.',
  'Feel the toe push off.',
  'Feel the lift and swing.',
  'Breathe in for two steps.',
  'Breathe out for two steps.',
  'Notice the space around you.',
  'Feel the air on your skin.',
  'Where is your attention?',
]

function WalkingMeditation({ practice, phaseColour, phase, depth, onSessionComplete }) {
  const [minutes, setMinutes] = useState(practice.duration)
  const [paceIdx, setPaceIdx] = useState(1)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const [stepCount, setStepCount] = useState(0)
  const [cueIdx, setCueIdx] = useState(0)
  const timerRef = useRef(null)
  const stepRef = useRef(null)

  const total = minutes * 60
  const progress = elapsed / total
  const pace = WALK_PACES[paceIdx]
  const stepIntervalMs = Math.round(60000 / pace.stepsPerMin)

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        if (next >= total) {
          clearInterval(timerRef.current)
          clearInterval(stepRef.current)
          setRunning(false)
          setDone(true)
          strikeBowl(0.5)
          logSession({ type: 'walking', practiceId: practice.id, durationSeconds: next, phase, depth }).then(id => onSessionComplete?.(id, 'walking'))
          return next
        }
        if (next % 300 === 0) ringIntervalBell(0.2)
        return next
      })
    }, 1000)
    // Step pulse
    stepRef.current = setInterval(() => {
      setStepCount(s => s + 1)
      setCueIdx(i => (i + 1) % WALK_CUES.length)
      playHoldTone(0.15, 0.05)
    }, stepIntervalMs)
    return () => {
      clearInterval(timerRef.current)
      clearInterval(stepRef.current)
    }
  }, [running, stepIntervalMs])

  function reset() {
    clearInterval(timerRef.current)
    clearInterval(stepRef.current)
    setRunning(false)
    setElapsed(0)
    setDone(false)
    setStepCount(0)
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const circumference = 2 * Math.PI * 80

  return (
    <div className="breathwork-view">
      <div className="breathwork-header">
        <span className="font-mono breathwork-glyph" style={{ color: phaseColour }}>{practice.glyph}</span>
        <div>
          <h2 className="font-serif breathwork-title">{practice.name}</h2>
          <p className="text-dim breathwork-desc">{practice.desc}</p>
        </div>
      </div>

      {/* Pace selector */}
      {!running && !done && (
        <div className="meditation-duration">
          <div className="text-dim meditation-dur-label font-mono">Pace</div>
          <div className="meditation-dur-options">
            {WALK_PACES.map((p, i) => (
              <button
                key={i}
                className={`meditation-dur-btn ${paceIdx === i ? 'meditation-dur-btn--active' : ''}`}
                style={paceIdx === i ? { borderColor: phaseColour, color: phaseColour } : {}}
                onClick={() => setPaceIdx(i)}
              >{p.label}</button>
            ))}
          </div>
          <div className="text-dim" style={{ fontSize: 12, marginTop: 4 }}>{pace.desc}</div>
        </div>
      )}

      {/* Duration */}
      {!running && !done && (
        <div className="meditation-duration">
          <div className="text-dim meditation-dur-label font-mono">Duration</div>
          <div className="meditation-dur-options">
            {[10, 20, 30, 45].map(m => (
              <button
                key={m}
                className={`meditation-dur-btn ${minutes === m ? 'meditation-dur-btn--active' : ''}`}
                style={minutes === m ? { borderColor: phaseColour, color: phaseColour } : {}}
                onClick={() => setMinutes(m)}
              >{m}m</button>
            ))}
          </div>
        </div>
      )}

      {/* Circle + cue */}
      <div className="breathwork-circle-wrap">
        <svg className="breathwork-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="100" cy="100" r="80"
            fill="none" stroke={phaseColour} strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          <text x="100" y="92" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily="Georgia, serif">
            {done ? 'complete' : running ? `${stepCount} steps` : 'ready'}
          </text>
          <text x="100" y="118" textAnchor="middle"
            fill={done ? phaseColour : 'var(--text-bright)'}
            fontSize={done ? '26' : '30'} fontFamily="'Courier New', monospace" fontWeight="bold">
            {done ? '⟲' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
        </svg>
      </div>

      {/* Awareness cue during walk */}
      {running && (
        <div className="walking-cue" style={{ borderLeftColor: phaseColour }}>
          {WALK_CUES[cueIdx]}
        </div>
      )}

      <div className="breathwork-controls">
        {!done ? (
          <>
            <button
              className="btn-primary breathwork-btn"
              style={{ background: phaseColour, borderColor: phaseColour }}
              onClick={() => {
                if (!running && elapsed === 0) strikeBowl(0.4)
                setRunning(r => !r)
              }}
            >
              {running ? 'Pause' : (elapsed > 0 ? 'Resume' : 'Begin Walking')}
            </button>
            {elapsed > 0 && <button className="btn-ghost" onClick={reset}>Reset</button>}
          </>
        ) : (
          <div className="practice-complete-card">
            <div className="font-serif practice-complete-text">{mins} minutes. {stepCount} conscious steps.</div>
            <button className="btn-ghost" onClick={reset}>Walk again</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shadow work prompts ───────────────────────────────────────────────────────

function ShadowPrompts({ practice, phaseColour, phase, depth, onComplete }) {
  const [step, setStep] = useState(0)
  const [responses, setResponses] = useState({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    const drone = startShadowDrone(0.07)
    return () => drone.stop()
  }, [])

  const prompts = practice.prompts || []
  const current = prompts[step]
  const isLast = step === prompts.length - 1

  function next() {
    if (isLast) {
      setDone(true)
      logSession({ type: 'shadow_work', practiceId: practice.id, durationSeconds: practice.duration * 60, phase, depth })
      onComplete?.()
      return
    }
    setStep(s => s + 1)
  }

  function reset() {
    setStep(0)
    setResponses({})
    setDone(false)
  }

  return (
    <div className="shadow-view">
      <div className="breathwork-header">
        <span className="font-mono breathwork-glyph" style={{ color: phaseColour }}>{practice.glyph}</span>
        <div>
          <h2 className="font-serif breathwork-title">{practice.name}</h2>
          <p className="text-dim breathwork-desc">{practice.desc}</p>
        </div>
      </div>

      {!done ? (
        <div className="shadow-session">
          {/* Progress */}
          <div className="shadow-progress">
            {prompts.map((_, i) => (
              <div
                key={i}
                className="shadow-progress-dot"
                style={{ background: i <= step ? phaseColour : 'var(--border)' }}
              />
            ))}
          </div>

          {/* Prompt */}
          <div className="shadow-prompt-card" style={{ borderLeftColor: phaseColour }}>
            <div className="shadow-prompt-num text-dim font-mono">{step + 1} / {prompts.length}</div>
            <p className="shadow-prompt-text font-serif">{current}</p>
          </div>

          {/* Response */}
          <textarea
            className="shadow-textarea"
            placeholder="Write what arises. Honesty over polish."
            value={responses[step] || ''}
            onChange={e => setResponses(r => ({ ...r, [step]: e.target.value }))}
            rows={5}
          />

          <button
            className="btn-primary shadow-next-btn"
            style={{ background: phaseColour, borderColor: phaseColour }}
            onClick={next}
          >
            {isLast ? 'Complete' : 'Next →'}
          </button>
        </div>
      ) : (
        <div className="practice-complete-card shadow-complete">
          <div className="practice-complete-glyph" style={{ color: phaseColour }}>⊗</div>
          <h3 className="font-serif">Session complete.</h3>
          <p className="text-dim">What you wrote belongs to you. The meeting happened.</p>
          <button className="btn-ghost" onClick={reset}>Begin again</button>
        </div>
      )}
    </div>
  )
}
