import React, { useState, useEffect, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import CovenantView from './CovenantView'
import { getDailyWisdom, getNextWisdom } from '../../engine/wisdom'
import { getDoorGreeting } from '../../engine/doors'
import { PHASE_COLOURS } from '../../theme/colours'
import { SUBJECTS } from '../../data/subjects'
import { CLASSROOMS, getClassroomProgress, getNextSubjectInClassroom } from '../../data/classrooms'
import { KEYS } from '../../data/schema'
import { PROTOCOL_MAP } from '../../engine/assessment'
import { getDailyCard } from '../../engine/tarot'
import { PULSE_QUESTIONS, scorePulse, shouldShowPulse } from '../../engine/pulse'
import { getLunarPhase } from '../../engine/lunar'
import SkyPanel from '../components/SkyPanel'
import OracleView from './OracleView'
import WheelView from './WheelView'
import { extractPatterns } from '../../engine/journalPatterns'
import { canCastToday } from '../../engine/oracle'
import { getNearestThreshold } from '../../engine/cosmos'
import './HomeView.css'

export default function HomeView({ onNavigate }) {
  const nav = onNavigate || (() => {})
  const { state } = useStore()
  const phase = state?.coordinates?.phase || state?.phase || 1
  const door = state?.door || 'SEEKER'
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8888CC'
  const phaseGlyph = PHASE_COLOURS[phase]?.glyph || '⟟'
  const phaseName = PHASE_COLOURS[phase]?.name || 'CENTER'
  const depthName = state?.depthKey
    ? state.depthKey.charAt(0) + state.depthKey.slice(1).toLowerCase()
    : 'Nigredo'

  const [progress, setProgress] = useState({})
  const [journalCount, setJournalCount] = useState(0)
  const [guideCount, setGuideCount] = useState(0)
  const [streaks, setStreaks] = useState({ current: 0, totalSessions: 0, totalMinutes: 0 })
  const [wisdom, setWisdom] = useState(null)
  const [tarotDraw, setTarotDraw] = useState(null)   // { card, entry, isNew }
  const [tarotExpanded, setTarotExpanded] = useState(false)
  const [pulseReady, setPulseReady] = useState(false)   // true if 7+ days since last pulse
  const [pulseOpen, setPulseOpen] = useState(false)
  const [pulseAnswers, setPulseAnswers] = useState({})
  const [pulseStep, setPulseStep] = useState(0)  // 0-6 = questions, 7 = result
  const [pulseResult, setPulseResult] = useState(null)
  const [journalPatterns, setJournalPatterns] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [showCovenant, setShowCovenant] = useState(false)
  const [hemisphere, setHemisphere] = useState('n')
  const [skyEnabled, setSkyEnabled] = useState(true)
  const [showOracle, setShowOracle] = useState(false)
  const [oracleCanCast, setOracleCanCast] = useState(true)
  const [showWheel, setShowWheel] = useState(false)
  const [activeCeremony, setActiveCeremony] = useState(null)

  // Covenant surfacing: check 90-day anniversary
  useEffect(() => {
    if (!state?.onboarded || !state?.assessedAt) return
    getStoreValue(KEYS.COVENANT).then(cov => {
      if (!cov) return // no covenant yet — let onboarding handle first-time
      const daysSince = Math.floor(
        (Date.now() - new Date(cov.date).getTime()) / (1000 * 60 * 60 * 24)
      )
      // Surface every 90 days
      if (daysSince > 0 && daysSince % 90 === 0) setShowCovenant(true)
    })
  }, [])

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.PROGRESS),
      getStoreValue(KEYS.JOURNAL),
      getStoreValue('guide_messages'),
      getStoreValue(KEYS.STREAKS),
      getStoreValue(KEYS.WISDOM_TODAY),
      getStoreValue(KEYS.WISDOM_SEEN),
      getStoreValue(KEYS.TAROT_HISTORY),
      getStoreValue(KEYS.WEEKLY_PULSE),
      getStoreValue(KEYS.JOURNAL_PATTERNS),
    ]).then(async ([prog, journal, guide, streak, wisdomToday, wisdomSeen, tarotHistory, weeklyPulse, savedPatterns]) => {
      setProgress(prog || {})
      const entries = journal || []
      setJournalEntries(entries)
      setJournalCount(entries.length)
      setGuideCount((guide || []).filter(m => m.role === 'assistant').length)
      setStreaks(streak || { current: 0, totalSessions: 0, totalMinutes: 0 })

      // Journal pattern detection — recompute if entries exist
      if (entries.length >= 3) {
        const patterns = extractPatterns(entries, { minCount: 2 })
        setJournalPatterns(patterns.slice(0, 8))
        await setStoreValue(KEYS.JOURNAL_PATTERNS, patterns)
      } else if (savedPatterns) {
        setJournalPatterns(savedPatterns.slice(0, 8))
      }

      // Wisdom rotation — serve cached today's wisdom or pick next unseen
      const today = new Date().toISOString().slice(0, 10)
      if (wisdomToday && wisdomToday.date === today) {
        setWisdom(wisdomToday)
      } else {
        const seen = wisdomSeen || []
        const next = getNextWisdom(phase, door, seen)
        const newSeen = seen.includes(next.globalIndex)
          ? seen
          : [...seen, next.globalIndex]
        const finalSeen = newSeen.length >= 49 ? [] : newSeen
        await setStoreValue(KEYS.WISDOM_SEEN, finalSeen)
        await setStoreValue(KEYS.WISDOM_TODAY, next)
        setWisdom(next)
      }

      // Tarot daily draw
      const history = tarotHistory || []
      const draw = getDailyCard(history)
      setTarotDraw(draw)
      if (draw.isNew && draw.card) {
        const entry = { date: today, cardNumber: draw.card.number, cardName: draw.card.name, phase }
        const updatedHistory = [...history, entry].slice(-90) // keep 90 days
        await setStoreValue(KEYS.TAROT_HISTORY, updatedHistory)
      }

      // Weekly pulse check
      setPulseReady(shouldShowPulse(weeklyPulse || []))

      // Sky settings
      const [skyEn, hemi] = await Promise.all([
        getStoreValue(KEYS.SKY_ENABLED),
        getStoreValue(KEYS.HEMISPHERE),
      ])
      setSkyEnabled(skyEn !== false)
      setHemisphere(hemi || 'n')

      const oracleDate = await getStoreValue(KEYS.ORACLE_LAST_DATE)
      setOracleCanCast(canCastToday(oracleDate))

      const ceremony = await getStoreValue(KEYS.ACTIVE_CEREMONY)
      if (ceremony?.active) setActiveCeremony(ceremony)
    })
  }, [])

  async function completePulse() {
    const result = scorePulse(pulseAnswers)
    setPulseResult(result)
    setPulseStep(7)
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      answers: pulseAnswers,
      phase: result.phase,
      phaseName: result.phaseName,
      previousPhase: phase,
    }
    const existing = await getStoreValue(KEYS.WEEKLY_PULSE) || []
    await setStoreValue(KEYS.WEEKLY_PULSE, [...existing, entry].slice(-52))
    setPulseReady(false)
  }

  const completedIds = Object.keys(progress).filter(k => progress[k]?.status === 'completed')
  const startedIds = Object.keys(progress).filter(k => progress[k]?.status === 'started')

  // Wisdom from rotation state; fall back to synchronous until store resolves
  const displayWisdom = wisdom || getDailyWisdom(phase, door)
  const greeting = getDoorGreeting(door)

  // Active classrooms — those with some progress
  const activeClassrooms = useMemo(() => {
    return CLASSROOMS.map(c => ({
      ...c,
      prog: getClassroomProgress(c.id, completedIds),
      next: getNextSubjectInClassroom(c.id, completedIds),
    })).filter(c => c.prog.completed > 0).slice(0, 3)
  }, [completedIds])

  // Suggest a classroom if none started
  const suggestedClassroom = useMemo(() => {
    if (activeClassrooms.length > 0) return null
    return CLASSROOMS[0] // The Foundation
  }, [activeClassrooms])

  return (
    <div className="home-view">
      {/* Header */}
      <div className="home-header">
        <div className="greeting font-serif">{greeting}</div>
        <div className="coordinates">
          <span className="coord-glyph font-mono" style={{ color: phaseColour }}>{phaseGlyph}</span>
          <span className="coord-text" style={{ color: phaseColour }}>{phaseName}</span>
          <span className="coord-sep text-dim">·</span>
          <span className="coord-depth text-dim">{depthName}</span>
        </div>
      </div>

      {/* Wisdom card */}
      <div className="wisdom-card card">
        <div className="wisdom-label text-dim font-mono">Daily Transmission</div>
        <blockquote className="wisdom-text font-serif">
          "{displayWisdom?.text}"
        </blockquote>
        {displayWisdom?.source && (
          <div className="wisdom-source text-dim">— {displayWisdom.source}</div>
        )}
      </div>

      {/* Weekly pulse prompt */}
      {pulseReady && !pulseOpen && (
        <button
          className="pulse-banner card"
          onClick={() => { setPulseOpen(true); setPulseStep(0); setPulseAnswers({}) }}
        >
          <span className="pulse-banner-glyph font-mono" style={{ color: phaseColour }}>⟲</span>
          <div className="pulse-banner-text">
            <div className="pulse-banner-title text-bright">Weekly Check-In</div>
            <div className="pulse-banner-sub text-dim">7 questions · 2 minutes · See how you've shifted</div>
          </div>
          <span className="pulse-banner-cta text-dim">Begin →</span>
        </button>
      )}

      {/* Pulse modal */}
      {pulseOpen && (
        <div className="pulse-modal card">
          {pulseStep < 7 ? (
            <div className="pulse-question-view">
              <div className="pulse-progress-bar">
                <div className="pulse-progress-fill" style={{ width: `${((pulseStep) / 7) * 100}%`, background: phaseColour }} />
              </div>
              <div className="pulse-q-header text-dim font-mono">
                Question {pulseStep + 1} of 7 · Phase {PULSE_QUESTIONS[pulseStep].phase}
              </div>
              <div className="pulse-question text-bright">
                {PULSE_QUESTIONS[pulseStep].question}
              </div>
              <div className="pulse-scale-labels text-dim">
                <span>{PULSE_QUESTIONS[pulseStep].low}</span>
                <span>{PULSE_QUESTIONS[pulseStep].high}</span>
              </div>
              <div className="pulse-scale">
                {[1,2,3,4,5].map(v => (
                  <button
                    key={v}
                    className={`pulse-scale-btn ${pulseAnswers[PULSE_QUESTIONS[pulseStep].id] === v ? 'pulse-scale-btn--active' : ''}`}
                    style={pulseAnswers[PULSE_QUESTIONS[pulseStep].id] === v ? { borderColor: phaseColour, color: phaseColour } : {}}
                    onClick={() => {
                      const id = PULSE_QUESTIONS[pulseStep].id
                      setPulseAnswers(a => ({ ...a, [id]: v }))
                      setTimeout(() => {
                        if (pulseStep < 6) setPulseStep(s => s + 1)
                        else completePulse()
                      }, 220)
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button className="btn-ghost pulse-cancel" onClick={() => setPulseOpen(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="pulse-result-view">
              <div className="pulse-result-glyph font-mono" style={{ color: phaseColour }}>
                {pulseResult?.phaseGlyph}
              </div>
              <div className="pulse-result-title text-bright">
                {pulseResult?.phase === phase
                  ? `Still in Phase ${phase} — ${pulseResult?.phaseName}`
                  : `Pulse reads Phase ${pulseResult?.phase} — ${pulseResult?.phaseName}`
                }
              </div>
              <div className="pulse-result-sub text-dim">
                {pulseResult?.phase === phase
                  ? 'Your phase is consistent with your last assessment.'
                  : `Your pulse suggests a shift. Consider a full re-assessment in Settings.`
                }
              </div>
              <button
                className="btn-primary"
                style={{ background: phaseColour, borderColor: phaseColour }}
                onClick={() => setPulseOpen(false)}
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="home-stats">
        <div className="stat-card card">
          <div className="stat-num font-mono" style={{ color: phaseColour }}>{completedIds.length}</div>
          <div className="stat-label text-dim">subjects complete</div>
        </div>
        <div className="stat-card card">
          <div className="stat-num font-mono" style={{ color: phaseColour }}>
            {streaks.current > 0 ? `${streaks.current}d` : '—'}
          </div>
          <div className="stat-label text-dim">practice streak</div>
        </div>
        <div className="stat-card card">
          <div className="stat-num font-mono" style={{ color: phaseColour }}>{streaks.totalSessions || 0}</div>
          <div className="stat-label text-dim">sessions</div>
        </div>
        <div className="stat-card card">
          <div className="stat-num font-mono" style={{ color: phaseColour }}>{journalCount}</div>
          <div className="stat-label text-dim">journal entries</div>
        </div>
      </div>

      {/* Recommended practice */}
      {PROTOCOL_MAP[phase] && (
        <button className="recommended-practice card" onClick={() => nav('practice')}>
          <div className="rec-left">
            <div className="rec-label text-dim font-mono">Phase {phase} · Recommended practice</div>
            <div className="rec-name text-bright">{PROTOCOL_MAP[phase].label}</div>
            <div className="rec-desc text-dim">{PROTOCOL_MAP[phase].type} · Start now →</div>
          </div>
          <span className="rec-glyph font-mono text-glyph" style={{ color: phaseColour }}>
            {phaseGlyph}
          </span>
        </button>
      )}

      {/* Daily tarot draw */}
      {tarotDraw?.card && (
        <div className="tarot-card card">
          <button
            className="tarot-header"
            onClick={() => setTarotExpanded(x => !x)}
          >
            <span className="tarot-glyph font-mono" style={{ color: phaseColour }}>{tarotDraw.card.glyph}</span>
            <div className="tarot-header-info">
              <div className="tarot-label text-dim font-mono">Daily Draw · {tarotDraw.card.number === 0 ? '0' : tarotDraw.card.number} · {tarotDraw.card.keyword}</div>
              <div className="tarot-name text-bright">{tarotDraw.card.name}</div>
            </div>
            <span className="tarot-toggle text-dim">{tarotExpanded ? '▲' : '▼'}</span>
          </button>
          {tarotExpanded && (
            <div className="tarot-body">
              <p className="tarot-upright">{tarotDraw.card.upright}</p>
              <div className="tarot-shadow-block">
                <div className="tarot-shadow-label text-dim font-mono">Shadow</div>
                <p className="tarot-shadow text-dim">{tarotDraw.card.shadow}</p>
              </div>
              <div className="tarot-question" style={{ borderLeftColor: phaseColour }}>
                <span className="tarot-question-label text-dim font-mono">Contemplate · </span>
                <span className="tarot-question-text">{tarotDraw.card.question}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active ceremony banner */}
      {activeCeremony?.active && (
        <button className="ceremony-banner card" onClick={() => nav('ceremonies')}>
          <span className="ceremony-banner-glyph font-mono">⊗</span>
          <div>
            <div className="ceremony-banner-label">Active Ceremony Arc</div>
            <div className="ceremony-banner-sub text-dim">
              Day {activeCeremony.dayIndex + 1} / {activeCeremony.arcLength} · {activeCeremony.arcId}
            </div>
          </div>
        </button>
      )}

      {/* Lunar phase + Sky panel */}
      {skyEnabled && <SkyPanel hemisphere={hemisphere} collapsed={true} />}
      {!skyEnabled && (() => {
        const lunar = getLunarPhase()
        return (
          <div className="lunar-card card">
            <div className="lunar-header">
              <span className="lunar-glyph">{lunar.glyph}</span>
              <div className="lunar-info">
                <div className="lunar-label text-dim font-mono">Lunar Rhythm · {lunar.illumination}% illuminated</div>
                <div className="lunar-name text-bright">{lunar.name}</div>
              </div>
            </div>
            <p className="lunar-rhythm text-dim">{lunar.rhythm}</p>
          </div>
        )
      })()}

      {/* Wheel of the Year banner — show when threshold ≤7 days */}
      {(() => {
        const t = getNearestThreshold(new Date(), hemisphere)
        if (!t || t.daysAway > 7) return null
        return (
          <button className="wheel-banner card" onClick={() => setShowWheel(true)}>
            <span className="wheel-banner-glyph">{t.glyph}</span>
            <div>
              <div className="wheel-banner-name">{t.name}</div>
              <div className="wheel-banner-sub text-dim">
                {t.daysAway === 0 ? 'The threshold is open today' : `${t.daysAway} days · ${t.energy}`}
              </div>
            </div>
          </button>
        )
      })()}

      {/* Oracle card */}
      <button
        className={`oracle-home-card card ${!oracleCanCast ? 'oracle-home-card--used' : ''}`}
        onClick={() => setShowOracle(true)}
      >
        <span className="oracle-home-glyph font-mono">⟟</span>
        <div className="oracle-home-text">
          <div className="oracle-home-label">The Oracle</div>
          <div className="oracle-home-sub text-dim">
            {oracleCanCast ? 'Ask your question. One casting per day.' : 'You have cast today. Return tomorrow.'}
          </div>
        </div>
      </button>

      {/* Active classrooms */}
      {activeClassrooms.length > 0 && (
        <div className="home-section">
          <div className="home-section-label text-dim font-mono">Active Paths</div>
          <div className="home-classroom-list">
            {activeClassrooms.map(c => (
              <div key={c.id} className="home-classroom-card card">
                <div className="home-classroom-top">
                  <span className="font-mono" style={{ color: c.colour, fontSize: 20 }}>{c.glyph}</span>
                  <div className="home-classroom-info">
                    <div className="home-classroom-name">{c.name}</div>
                    <div className="text-dim home-classroom-stats">{c.prog.completed}/{c.prog.total} · {c.prog.pct}%</div>
                  </div>
                </div>
                <div className="home-classroom-bar">
                  <div className="home-classroom-fill" style={{ width: `${c.prog.pct}%`, background: c.colour }} />
                </div>
                {c.next && (
                  <div className="home-classroom-next text-dim">
                    Next: {SUBJECTS.find(s => s.id === c.next)?.name || c.next}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggest Foundation if no classrooms started */}
      {suggestedClassroom && (
        <div className="home-section">
          <div className="home-section-label text-dim font-mono">Recommended Starting Point</div>
          <div className="home-classroom-card card" style={{ borderColor: suggestedClassroom.colour }}>
            <div className="home-classroom-top">
              <span className="font-mono" style={{ color: suggestedClassroom.colour, fontSize: 20 }}>{suggestedClassroom.glyph}</span>
              <div className="home-classroom-info">
                <div className="home-classroom-name">{suggestedClassroom.name}</div>
                <div className="text-dim home-classroom-stats">{suggestedClassroom.subjects.length} subjects · {suggestedClassroom.estimatedHours}h</div>
              </div>
            </div>
            <p className="text-dim home-classroom-tagline">{suggestedClassroom.tagline}</p>
          </div>
        </div>
      )}

      {/* Recurring Threads */}
      {journalPatterns.length > 0 && (
        <div className="home-section">
          <div className="home-section-label text-dim font-mono">Recurring Threads</div>
          <div className="threads-card card">
            <div className="threads-list">
              {journalPatterns.map(p => (
                <button
                  key={p.word}
                  className="thread-chip"
                  style={{ '--phase-colour': phaseColour }}
                  onClick={() => nav('journal')}
                  title={`Appears ${p.count}× in recent entries`}
                >
                  <span className="thread-word">{p.word}</span>
                  <span className="thread-count text-dim">{p.count}</span>
                </button>
              ))}
            </div>
            <div className="threads-hint text-dim">Words recurring in your journal over the last 30 days</div>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="home-section">
        <div className="home-section-label text-dim font-mono">The School</div>
        <div className="quick-grid">
          <button className="quick-card card" onClick={() => nav('study')}>
            <span className="quick-glyph font-mono text-glyph">✧</span>
            <div className="quick-title text-bright">Study</div>
            <div className="quick-desc text-dim">{SUBJECTS.length} subjects · 28 domains</div>
          </button>
          <button className="quick-card card" onClick={() => nav('spiral')}>
            <span className="quick-glyph font-mono text-glyph">⟲</span>
            <div className="quick-title text-bright">Journey</div>
            <div className="quick-desc text-dim">{CLASSROOMS.length} curated learning paths</div>
          </button>
          <button className="quick-card card" onClick={() => nav('journal')}>
            <span className="quick-glyph font-mono text-glyph">≋</span>
            <div className="quick-title text-bright">Journal</div>
            <div className="quick-desc text-dim">{journalCount > 0 ? `${journalCount} entries` : 'Phase-prompted reflection'}</div>
          </button>
          <button className="quick-card card" onClick={() => nav('guide')}>
            <span className="quick-glyph font-mono text-glyph">⊚</span>
            <div className="quick-title text-bright">Sol Guide</div>
            <div className="quick-desc text-dim">{guideCount > 0 ? `${guideCount} exchanges` : 'Phase-aware AI guide'}</div>
          </button>
          <button className="quick-card card" onClick={() => nav('council')}>
            <span className="quick-glyph font-mono text-glyph">⊕</span>
            <div className="quick-title text-bright">Council</div>
            <div className="quick-desc text-dim">Multi-AI teacher roundtable</div>
          </button>
          <button className="quick-card card" onClick={() => nav('practice')}>
            <span className="quick-glyph font-mono text-glyph">Ψ</span>
            <div className="quick-title text-bright">Practice</div>
            <div className="quick-desc text-dim">Breathwork, meditation, shadow</div>
          </button>
          <button className="quick-card quick-card--support card" onClick={() => nav('threshold')}>
            <span className="quick-glyph font-mono" style={{ color: '#7060A0' }}>◎</span>
            <div className="quick-title" style={{ color: '#9080B0' }}>Support</div>
            <div className="quick-desc text-dim">Crisis lines · Breathing · Grounding</div>
          </button>
        </div>
      </div>
      {showCovenant && (
        <CovenantView
          isRevisit
          onComplete={() => setShowCovenant(false)}
        />
      )}
      {showOracle && (
        <OracleView onClose={() => { setShowOracle(false); setOracleCanCast(canCastToday(null)) }} />
      )}
      {showWheel && (
        <WheelView onClose={() => setShowWheel(false)} />
      )}
    </div>
  )
}
