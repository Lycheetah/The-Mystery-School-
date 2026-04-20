import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { marked } from 'marked'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import InitiationRiteView from './InitiationRiteView'
import { SUBJECTS, DOMAINS, getAvailableSubjects, getPrerequisiteChain } from '../../data/subjects'
import { UNCOMMON_SUBJECTS, UNCOMMON_DOMAINS } from '../../data/uncommon'
import { CLASSROOMS, getClassroomProgress, getNextSubjectInClassroom } from '../../data/classrooms'
import { PHASE_COLOURS } from '../../theme/colours'
import { KEYS, MASTERY_LEVELS, MASTERY_STAGES, slugify } from '../../data/schema'
import { meetsUnlockCondition, getUnlockProgress } from '../../engine/uncommonRoom'
import { VOID_SUBJECTS, VOID_DOMAINS } from '../../data/void'
import { meetsVoidUnlock, getVoidUnlockProgress } from '../../engine/voidRoom'
import {
  SUBJECT_CATALOGUE, SEVEN_PHASES, EMERALD_WORK, MYSTERY_SCHOOL,
  PROTOCOL_BREATHWORK, PROTOCOL_MINDFULNESS, PROTOCOL_SHADOW,
  HERMETIC_PRINCIPLES, GETTING_STARTED, QUICK_REFERENCE,
} from '../curriculum/index'
import { sortDomainsByDoor, getDoorPriorityDomains } from '../../engine/doors'
import './StudyView.css'

const LAYER_SYMBOL = { foundation: '●', middle: '◐', edge: '○' }
const LAYER_LABEL  = { foundation: 'Foundation', middle: 'Middle', edge: 'Edge' }

function linkifySubjects(html, subjects, currentId) {
  if (!html || !subjects || subjects.length === 0) return html
  const sorted = subjects.filter(s => s.id !== currentId && s.name.length >= 4)
    .sort((a, b) => b.name.length - a.name.length)
  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag
    if (!text || !text.trim()) return text
    let result = text
    for (const s of sorted) {
      if (!result.includes(s.name)) continue
      const escaped = s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'g')
      result = result.replace(re, `<a class="subject-xlink" data-sid="${s.id}">${s.name}</a>`)
    }
    return result
  })
}

// Map subjects to their curriculum reference
const SUBJECT_DOCS = {
  // Protocols
  breathwork:         PROTOCOL_BREATHWORK,
  mindfulness:        PROTOCOL_MINDFULNESS,
  shadow_work:        PROTOCOL_SHADOW,
  // Specific subjects by id
  hermetics:          HERMETIC_PRINCIPLES,
  seven_principles:   HERMETIC_PRINCIPLES,
  alchemy:            EMERALD_WORK,
  // Default fallback
  default:            SUBJECT_CATALOGUE,
}

function getDocForSubject(subject) {
  if (!subject) return SUBJECT_CATALOGUE
  if (subject.practiceType && SUBJECT_DOCS[subject.practiceType]) {
    return SUBJECT_DOCS[subject.practiceType]
  }
  return SUBJECT_CATALOGUE
}

// Reference library — top-level docs to browse
const REFERENCE_DOCS = [
  { id: 'getting_started',  title: 'Getting Started',           glyph: '⟟', content: GETTING_STARTED },
  { id: 'seven_phases',     title: 'The Seven Phases',          glyph: '⟲', content: SEVEN_PHASES },
  { id: 'emerald_work',     title: 'The Emerald Work',          glyph: 'Φ↑', content: EMERALD_WORK },
  { id: 'hermetic',         title: 'The Seven Hermetic Principles', glyph: 'Ψ', content: HERMETIC_PRINCIPLES },
  { id: 'breathwork',       title: 'Breathwork Protocols',      glyph: '≋', content: PROTOCOL_BREATHWORK },
  { id: 'mindfulness',      title: 'Mindfulness Protocols',     glyph: '◈', content: PROTOCOL_MINDFULNESS },
  { id: 'shadow',           title: 'Shadow Work Protocols',     glyph: '⊗', content: PROTOCOL_SHADOW },
  { id: 'catalogue',        title: 'Full Subject Catalogue',    glyph: '✧', content: SUBJECT_CATALOGUE },
  { id: 'quick_ref',        title: 'Quick Reference',           glyph: '∅', content: QUICK_REFERENCE },
]

export default function StudyView({ onNavigateTo }) {
  const { state } = useStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)   // { type: 'subject'|'doc'|'uncommon', data }
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [selectedUncommonDomain, setSelectedUncommonDomain] = useState(null)
  const [selectedVoidDomain, setSelectedVoidDomain] = useState(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [progress, setProgress] = useState({})
  const [activeTab, setActiveTab] = useState('subjects') // 'subjects' | 'classrooms' | 'library' | 'uncommon' | 'void'
  const [roomUnlocked, setRoomUnlocked] = useState(false)
  const [voidUnlocked, setVoidUnlocked] = useState(false)
  const [userClassrooms, setUserClassrooms] = useState([])
  const [creatingPath, setCreatingPath] = useState(false)
  const [completionAck, setCompletionAck] = useState(null) // { name, glyph, domain }
  const [masteryStages, setMasteryStages] = useState({})   // { [slug]: 0-4 }
  const [subjectNotes, setSubjectNotes] = useState({})     // { [slug]: string }
  const [studyModeOpen, setStudyModeOpen] = useState(false)
  const [initiationRite, setInitiationRite] = useState(null) // { classroom, journeyData }

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.PROGRESS),
      getStoreValue(KEYS.UNLOCKED_ROOM),
      getStoreValue(KEYS.VOID_ROOM),
      getStoreValue(KEYS.USER_CLASSROOMS),
      getStoreValue(KEYS.MASTERY_STAGES),
      getStoreValue(KEYS.SUBJECT_NOTES),
    ]).then(([p, unlocked, voidLocked, uc, ms, sn]) => {
      const prog = p || {}
      setProgress(prog)
      setRoomUnlocked(!!unlocked || meetsUnlockCondition(prog))
      setVoidUnlocked(!!voidLocked || meetsVoidUnlock(prog))
      setUserClassrooms(uc || [])
      setMasteryStages(ms || {})
      setSubjectNotes(sn || {})
    })
  }, [])

  const completedIds = Object.keys(progress).filter(k => progress[k]?.status === 'completed')
  const available = useMemo(() => new Set(getAvailableSubjects(completedIds).map(s => s.id)), [completedIds])

  // Uncommon room availability — unlocked if store flag OR mastery threshold met
  const unlockProg = useMemo(() => getUnlockProgress(progress), [progress])
  const uncommonAvailable = useMemo(() => new Set(
    UNCOMMON_SUBJECTS
      .filter(s => (s.prerequisites || []).every(id => completedIds.includes(id)))
      .map(s => s.id)
  ), [completedIds])

  // Void room availability
  const voidUnlockProg = useMemo(() => getVoidUnlockProgress(progress), [progress])
  const voidAvailable = useMemo(() => new Set(
    VOID_SUBJECTS
      .filter(s => (s.prerequisites || []).every(id =>
        completedIds.includes(id) ||
        UNCOMMON_SUBJECTS.some(u => u.id === id && progress[id]?.status === 'completed')
      ))
      .map(s => s.id)
  ), [completedIds, progress])

  const doorKey = state?.door || null

  // Group ALL subjects by domain
  const grouped = useMemo(() => {
    const groups = {}
    SUBJECTS.forEach(s => {
      if (!groups[s.domain]) groups[s.domain] = []
      groups[s.domain].push(s)
    })
    return groups
  }, [])

  // Ordered domain keys sorted by door priority
  const orderedDomains = useMemo(() => {
    const domains = Object.keys(grouped)
    return doorKey ? sortDomainsByDoor(domains, doorKey) : domains.sort()
  }, [grouped, doorKey])

  // Top 3 domains prioritised by this door (for badge)
  const doorTopDomains = useMemo(() => {
    if (!doorKey) return new Set()
    return new Set(getDoorPriorityDomains(doorKey, 3))
  }, [doorKey])

  // Subjects for the selected domain, filtered by search
  const domainSubjects = useMemo(() => {
    if (!selectedDomain) return []
    const subs = grouped[selectedDomain] || []
    if (!search.trim()) return subs
    const q = search.toLowerCase()
    return subs.filter(s => s.name.toLowerCase().includes(q))
  }, [grouped, selectedDomain, search])

  // Auto-select first domain on mount
  useEffect(() => {
    if (selectedDomain === null && orderedDomains.length > 0) {
      setSelectedDomain(orderedDomains[0])
    }
  }, [orderedDomains])

  // Ctrl+K — command palette toggle (capture phase so it beats Shell's Escape handler)
  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        e.stopPropagation()
        setCommandPaletteOpen(o => !o)
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.stopPropagation()
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [commandPaletteOpen])

  function askGuideAbout(subject) {
    if (onNavigateTo) onNavigateTo('guide', { prefill: `I'm studying "${subject.name}" — I want to go deeper into this.` })
  }

  function askCouncilAbout(subject) {
    if (onNavigateTo) onNavigateTo('council', { prefill: subject.name })
  }

  async function markComplete(subjectId) {
    const updated = {
      ...progress,
      [subjectId]: {
        ...(progress[subjectId] || {}),
        status: 'completed',
        completedAt: new Date().toISOString(),
      }
    }
    setProgress(updated)
    await setStoreValue(KEYS.PROGRESS, updated)
    if (!roomUnlocked && meetsUnlockCondition(updated)) {
      setRoomUnlocked(true)
      await setStoreValue(KEYS.UNLOCKED_ROOM, true)
    }
    if (!voidUnlocked && meetsVoidUnlock(updated)) {
      setVoidUnlocked(true)
      await setStoreValue(KEYS.VOID_ROOM, true)
    }
    // Show completion acknowledgment
    const subj = [...SUBJECTS, ...UNCOMMON_SUBJECTS, ...VOID_SUBJECTS].find(s => s.id === subjectId)
    if (subj) {
      setCompletionAck({ name: subj.name, domain: subj.domain })
      setTimeout(() => setCompletionAck(null), 3500)
    }
  }

  async function setMastery(subjectId, level) {
    const updated = {
      ...progress,
      [subjectId]: {
        ...(progress[subjectId] || {}),
        mastery: level,
        status: level >= 3 && progress[subjectId]?.status !== 'completed' ? 'started' : (progress[subjectId]?.status || 'started'),
      }
    }
    setProgress(updated)
    await setStoreValue(KEYS.PROGRESS, updated)
    if (!roomUnlocked && meetsUnlockCondition(updated)) {
      setRoomUnlocked(true)
      await setStoreValue(KEYS.UNLOCKED_ROOM, true)
    }
    if (!voidUnlocked && meetsVoidUnlock(updated)) {
      setVoidUnlocked(true)
      await setStoreValue(KEYS.VOID_ROOM, true)
    }
  }

  async function setMasteryStage(subjectName, stage) {
    const slug = slugify(subjectName)
    const updated = { ...masteryStages, [slug]: stage }
    setMasteryStages(updated)
    await setStoreValue(KEYS.MASTERY_STAGES, updated)

    // Check classroom completion for Initiation Rite
    if (stage >= MASTERY_STAGES.PRACTICED) {
      const initiated = await getStoreValue(KEYS.INITIATED_CLASSROOMS) || []
      for (const classroom of CLASSROOMS) {
        if (initiated.includes(classroom.id)) continue
        const allPractised = classroom.subjects.every(
          sid => (updated[slugify(SUBJECTS.find(s => s.id === sid)?.name || '')] || 0) >= MASTERY_STAGES.PRACTICED
        )
        if (allPractised) {
          const practiceLog = await getStoreValue(KEYS.PRACTICE_LOG) || []
          const classroomSubjectIds = new Set(classroom.subjects)
          const relatedPractices = practiceLog.filter(p => classroomSubjectIds.has(p.subjectId))
          const journeySubjects = classroom.subjects
            .map(sid => SUBJECTS.find(s => s.id === sid))
            .filter(Boolean)
            .map(s => ({
              name: s.name,
              masteryNote: progress[s.id]?.masteryNote || '',
            }))
          setInitiationRite({
            classroom,
            journeyData: {
              subjects: journeySubjects,
              practiceCount: relatedPractices.length,
              completedAt: new Date().toISOString(),
            },
          })
          break
        }
      }
    }
  }

  async function saveSubjectNote(subjectName, note) {
    const slug = slugify(subjectName)
    const updated = { ...subjectNotes, [slug]: note }
    setSubjectNotes(updated)
    await setStoreValue(KEYS.SUBJECT_NOTES, updated)
  }

  async function setMasteryNote(subjectId, note) {
    const updated = {
      ...progress,
      [subjectId]: {
        ...(progress[subjectId] || {}),
        masteryNote: note,
      }
    }
    setProgress(updated)
    await setStoreValue(KEYS.PROGRESS, updated)
  }

  async function markStarted(subjectId) {
    if (progress[subjectId]?.status === 'completed') return
    const updated = {
      ...progress,
      [subjectId]: {
        ...(progress[subjectId] || {}),
        status: 'started',
        startedAt: new Date().toISOString(),
      }
    }
    setProgress(updated)
    await setStoreValue(KEYS.PROGRESS, updated)
  }

  function selectSubject(s) {
    setSelected({ type: 'subject', data: s })
    markStarted(s.id)
    setStoreValue(KEYS.LAST_OPENED_SUBJECT, { id: s.id, name: s.name, domain: s.domain })
    // Auto-advance to ENCOUNTERED if not yet tracked
    const slug = slugify(s.name)
    if (!masteryStages[slug] || masteryStages[slug] === MASTERY_STAGES.NONE) {
      setMasteryStage(s.name, MASTERY_STAGES.ENCOUNTERED)
    }
  }

  const phaseColour = PHASE_COLOURS[state?.coordinates?.phase || 1]?.colour || '#C8A96E'

  return (
    <div className={`study-layout${studyModeOpen ? ' study-layout--immersive' : ''}`}>
      {/* Initiation Rite overlay */}
      {initiationRite && (
        <InitiationRiteView
          classroom={initiationRite.classroom}
          journeyData={initiationRite.journeyData}
          onComplete={() => setInitiationRite(null)}
        />
      )}
      {/* Subject completion acknowledgment */}
      {completionAck && (
        <div className="completion-ack" onClick={() => setCompletionAck(null)}>
          <span className="completion-ack-glyph font-mono" style={{ color: phaseColour }}>●</span>
          <div className="completion-ack-text">
            <div className="completion-ack-name">{completionAck.name}</div>
            <div className="completion-ack-sub text-dim">integrated · {completionAck.domain}</div>
          </div>
        </div>
      )}
      {/* Left panel — subject browser */}
      <div className={`study-sidebar${studyModeOpen ? ' study-sidebar--hidden' : ''}`}>
        {/* Tabs */}
        <div className="study-tabs">
          <button
            className={`study-tab ${activeTab === 'subjects' ? 'study-tab--active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >✧ Subjects</button>
          <button
            className={`study-tab ${activeTab === 'classrooms' ? 'study-tab--active' : ''}`}
            onClick={() => setActiveTab('classrooms')}
          >⟲ Paths</button>
          <button
            className={`study-tab ${activeTab === 'library' ? 'study-tab--active' : ''}`}
            onClick={() => setActiveTab('library')}
          >≋ Library</button>
          <button
            className={`study-tab study-tab--rare ${activeTab === 'uncommon' ? 'study-tab--active' : ''} ${roomUnlocked ? 'study-tab--rare-unlocked' : ''}`}
            onClick={() => setActiveTab('uncommon')}
          >◬ Rare</button>
          <button
            className={`study-tab study-tab--void ${activeTab === 'void' ? 'study-tab--active' : ''} ${voidUnlocked ? 'study-tab--void-unlocked' : ''}`}
            onClick={() => setActiveTab('void')}
          >⊗ Void</button>
        </div>

        {activeTab === 'subjects' && (
          <div className="study-browser">
            {/* Domain column */}
            <div className="domain-column">
              <div className="domain-column-header">
                <span className="text-dim" style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Domains</span>
                <button
                  className="domain-palette-btn"
                  onClick={() => setCommandPaletteOpen(true)}
                  title="Search all subjects (Ctrl+K)"
                >⌕</button>
              </div>
              <div className="domain-list">
                {orderedDomains.map(domain => {
                  const subs = grouped[domain] || []
                  const withMastery = subs.filter(s => (masteryStages[slugify(s.name)] || 0) > 0).length
                  const mastPct = subs.length > 0 ? withMastery / subs.length : 0
                  const dotColor = mastPct === 0 ? 'var(--border)' : mastPct < 0.5 ? 'var(--accent)' : '#6BAA80'
                  return (
                    <button
                      key={domain}
                      className={`domain-item ${selectedDomain === domain ? 'domain-item--active' : ''}`}
                      onClick={() => { setSelectedDomain(domain); setSearch('') }}
                    >
                      <span className="domain-item-name">{domain}</span>
                      <span className="domain-item-count">{subs.length}</span>
                      {doorTopDomains.has(domain) && <span className="domain-door-badge" title="Door priority">◎</span>}
                      <span className="domain-item-dot" style={{ background: dotColor }} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject column */}
            <div className="subject-column">
              {selectedDomain ? (
                <>
                  <div className="subject-column-header">
                    <span className="subject-column-title">{selectedDomain}</span>
                    <span className="text-dim" style={{ fontSize: 11 }}>{domainSubjects.length}</span>
                  </div>
                  <input
                    className="study-search"
                    placeholder="Filter…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="subject-list">
                    {domainSubjects.map(s => {
                      const isAvail = available.has(s.id)
                      const stage = masteryStages[slugify(s.name)] || 0
                      const ml = MASTERY_LEVELS[stage]
                      return (
                        <button
                          key={s.id}
                          className={`subject-row ${selected?.data?.id === s.id ? 'subject-row--active' : ''} ${!isAvail ? 'subject-row--locked' : ''}`}
                          onClick={() => { if (isAvail) selectSubject(s) }}
                        >
                          <span className="subject-layer">{LAYER_SYMBOL[s.layer]}</span>
                          <span className="subject-name">{s.name}</span>
                          <span className="subject-meta">
                            {!isAvail && <span className="status-locked text-dim">🔒</span>}
                            {isAvail && <span className="subject-mastery font-mono" style={{ color: ml.colour, fontSize: 13 }}>{ml.glyph}</span>}
                          </span>
                        </button>
                      )
                    })}
                    {domainSubjects.length === 0 && search && (
                      <div className="subject-column-empty">No matches</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="subject-column-empty">Select a domain</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'classrooms' && (
          <div className="classroom-list">
            {CLASSROOMS.map(classroom => {
              const prog = getClassroomProgress(classroom.id, completedIds)
              return (
                <button
                  key={classroom.id}
                  className={`classroom-item ${selected?.data?.id === classroom.id && selected?.type === 'classroom' ? 'classroom-item--active' : ''}`}
                  onClick={() => { setCreatingPath(false); setSelected({ type: 'classroom', data: classroom }) }}
                >
                  <div className="classroom-item-top">
                    <span className="classroom-glyph font-mono" style={{ color: classroom.colour }}>{classroom.glyph}</span>
                    <div className="classroom-item-info">
                      <div className="classroom-item-name">{classroom.name}</div>
                      <div className="classroom-item-meta text-dim">{classroom.subjects.length} subjects · {classroom.estimatedHours}h</div>
                    </div>
                  </div>
                  <div className="classroom-progress-bar">
                    <div
                      className="classroom-progress-fill"
                      style={{ width: `${prog.pct}%`, background: classroom.colour }}
                    />
                  </div>
                  <div className="classroom-progress-text text-dim">{prog.completed}/{prog.total}</div>
                </button>
              )
            })}

            {userClassrooms.length > 0 && (
              <>
                <div className="classroom-divider text-dim">Your Paths</div>
                {userClassrooms.map(uc => {
                  const total = uc.subjects.length
                  const completed = uc.subjects.filter(id => completedIds.includes(id)).length
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                  return (
                    <button
                      key={uc.id}
                      className={`classroom-item classroom-item--user ${selected?.data?.id === uc.id && selected?.type === 'user_classroom' ? 'classroom-item--active' : ''}`}
                      onClick={() => { setCreatingPath(false); setSelected({ type: 'user_classroom', data: uc }) }}
                    >
                      <div className="classroom-item-top">
                        <span className="classroom-glyph font-mono" style={{ color: uc.colour }}>{uc.glyph}</span>
                        <div className="classroom-item-info">
                          <div className="classroom-item-name">{uc.name}</div>
                          <div className="classroom-item-meta text-dim">{total} subjects</div>
                        </div>
                      </div>
                      <div className="classroom-progress-bar">
                        <div className="classroom-progress-fill" style={{ width: `${pct}%`, background: uc.colour }} />
                      </div>
                      <div className="classroom-progress-text text-dim">{completed}/{total}</div>
                    </button>
                  )
                })}
              </>
            )}

            <button
              className="classroom-create-btn"
              onClick={() => { setCreatingPath(true); setSelected(null) }}
            >
              + Create New Path
            </button>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="library-list">
            {REFERENCE_DOCS.map(doc => (
              <button
                key={doc.id}
                className={`library-item ${selected?.data?.id === doc.id ? 'library-item--active' : ''}`}
                onClick={() => setSelected({ type: 'doc', data: doc })}
              >
                <span className="library-glyph font-mono">{doc.glyph}</span>
                <span className="library-title">{doc.title}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'uncommon' && (
          <div className="uncommon-panel">
            {!roomUnlocked ? (
              <LockedRoomState unlockProg={unlockProg} />
            ) : (
              <UncommonRoomList
                subjects={UNCOMMON_SUBJECTS}
                domains={UNCOMMON_DOMAINS}
                progress={progress}
                available={uncommonAvailable}
                selected={selected}
                onSelect={s => {
                  setSelected({ type: 'uncommon', data: s })
                  if (!progress[s.id]?.status) {
                    markStarted(s.id)
                  }
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'void' && (
          <div className="void-panel">
            {!voidUnlocked ? (
              <LockedVoidState voidUnlockProg={voidUnlockProg} />
            ) : (
              <VoidRoomList
                subjects={VOID_SUBJECTS}
                domains={VOID_DOMAINS}
                progress={progress}
                available={voidAvailable}
                selected={selected}
                onSelect={s => {
                  setSelected({ type: 'void', data: s })
                  if (!progress[s.id]?.status) {
                    markStarted(s.id)
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onSelect={s => {
            setCommandPaletteOpen(false)
            if (s._tier === 'uncommon') {
              setActiveTab('uncommon')
              setSelected({ type: 'uncommon', data: s })
            } else if (s._tier === 'void') {
              setActiveTab('void')
              setSelected({ type: 'void', data: s })
            } else {
              setActiveTab('subjects')
              setSelectedDomain(s.domain)
              setSelected({ type: 'subject', data: s })
            }
            markStarted(s.id)
          }}
          progress={progress}
          available={available}
          uncommonAvailable={uncommonAvailable}
          voidAvailable={voidAvailable}
          roomUnlocked={roomUnlocked}
          voidUnlocked={voidUnlocked}
        />
      )}

      {/* Right panel — content */}
      <div className="study-main">
        {!selected && !creatingPath && <EmptyState />}
        {creatingPath && (
          <PathCreator
            subjects={SUBJECTS}
            onSave={async (uc) => {
              const updated = [...userClassrooms, uc]
              setUserClassrooms(updated)
              await setStoreValue(KEYS.USER_CLASSROOMS, updated)
              setCreatingPath(false)
              setSelected({ type: 'user_classroom', data: uc })
            }}
            onCancel={() => setCreatingPath(false)}
          />
        )}
        {selected?.type === 'subject' && (
          <SubjectDetail
            subject={selected.data}
            progress={progress}
            available={available}
            masteryStage={masteryStages[slugify(selected.data.name)] || 0}
            subjectNote={subjectNotes[slugify(selected.data.name)] || ''}
            studyModeOpen={studyModeOpen}
            onEnterStudyMode={() => setStudyModeOpen(true)}
            onExitStudyMode={() => setStudyModeOpen(false)}
            onComplete={() => markComplete(selected.data.id)}
            onMastery={(id, level) => setMastery(id, level)}
            onMasteryNote={(id, note) => setMasteryNote(id, note)}
            onSetMasteryStage={(name, stage) => setMasteryStage(name, stage)}
            onSaveNote={(name, note) => saveSubjectNote(name, note)}
            onNavigate={id => {
              const s = SUBJECTS.find(x => x.id === id)
              if (s) selectSubject(s)
            }}
            onAskGuide={() => askGuideAbout(selected.data)}
            onAskCouncil={() => askCouncilAbout(selected.data)}
          />
        )}
        {selected?.type === 'classroom' && (
          <ClassroomDetail
            classroom={selected.data}
            progress={progress}
            completedIds={completedIds}
            available={available}
            masteryStages={masteryStages}
            onNavigate={id => {
              const s = SUBJECTS.find(x => x.id === id)
              if (s) {
                setActiveTab('subjects')
                setSelected({ type: 'subject', data: s })
                markStarted(s.id)
              }
            }}
          />
        )}
        {selected?.type === 'user_classroom' && (
          <UserClassroomDetail
            classroom={selected.data}
            progress={progress}
            completedIds={completedIds}
            available={available}
            onNavigate={id => {
              const s = SUBJECTS.find(x => x.id === id)
              if (s) {
                setActiveTab('subjects')
                setSelected({ type: 'subject', data: s })
                markStarted(s.id)
              }
            }}
            onDelete={async () => {
              const updated = userClassrooms.filter(c => c.id !== selected.data.id)
              setUserClassrooms(updated)
              await setStoreValue(KEYS.USER_CLASSROOMS, updated)
              setSelected(null)
            }}
            onEdit={async (updated) => {
              const list = userClassrooms.map(c => c.id === updated.id ? updated : c)
              setUserClassrooms(list)
              await setStoreValue(KEYS.USER_CLASSROOMS, list)
              setSelected({ type: 'user_classroom', data: updated })
            }}
          />
        )}
        {selected?.type === 'doc' && (
          <DocReader doc={selected.data} />
        )}
        {selected?.type === 'uncommon' && (
          <SubjectDetail
            subject={selected.data}
            progress={progress}
            available={uncommonAvailable}
            onComplete={() => markComplete(selected.data.id)}
            onMastery={(id, level) => setMastery(id, level)}
            onMasteryNote={(id, note) => setMasteryNote(id, note)}
            onNavigate={id => {
              const s = SUBJECTS.find(x => x.id === id) || UNCOMMON_SUBJECTS.find(x => x.id === id)
              if (s) {
                const type = UNCOMMON_SUBJECTS.find(x => x.id === id) ? 'uncommon' : 'subject'
                setSelected({ type, data: s })
              }
            }}
            tierBadge="◬ Uncommon"
            onAskGuide={() => askGuideAbout(selected.data)}
            onAskCouncil={() => askCouncilAbout(selected.data)}
          />
        )}
        {selected?.type === 'void' && (
          <SubjectDetail
            subject={selected.data}
            progress={progress}
            available={voidAvailable}
            onComplete={() => markComplete(selected.data.id)}
            onMastery={(id, level) => setMastery(id, level)}
            onMasteryNote={(id, note) => setMasteryNote(id, note)}
            onNavigate={id => {
              const s = SUBJECTS.find(x => x.id === id)
                     || UNCOMMON_SUBJECTS.find(x => x.id === id)
                     || VOID_SUBJECTS.find(x => x.id === id)
              if (s) {
                const type = VOID_SUBJECTS.find(x => x.id === id) ? 'void'
                  : UNCOMMON_SUBJECTS.find(x => x.id === id) ? 'uncommon'
                  : 'subject'
                setSelected({ type, data: s })
              }
            }}
            tierBadge="⊗ Void"
            onAskGuide={() => askGuideAbout(selected.data)}
            onAskCouncil={() => askCouncilAbout(selected.data)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="study-empty">
      <span className="study-empty-glyph font-mono">✧</span>
      <h2 className="font-serif">The Curriculum</h2>
      <p className="text-dim">Select a subject to begin. Foundation subjects unlock first.<br />
      Complete them in order to open the middle and edge layers.</p>
    </div>
  )
}

// ─── Subject detail ───────────────────────────────────────────────────────────

const STUDY_TABS = [
  { id: 'read',        label: 'Read',       glyph: '≡' },
  { id: 'reflect',     label: 'Reflect',    glyph: '◎' },
  { id: 'contemplate', label: 'Contemplate',glyph: '∴' },
  { id: 'socratic',    label: 'Socratic',   glyph: 'Ψ' },
  { id: 'apply',       label: 'Apply',      glyph: '⊕' },
  { id: 'connect',     label: 'Connect',    glyph: '⟡' },
  { id: 'practice',    label: 'Practice',   glyph: '⟳' },
  { id: 'notes',       label: 'Notes',      glyph: '✎' },
]

// Domain → practice type mapping for PRACTICE tab launch
const DOMAIN_PRACTICE_MAP = {
  'Meditation & Contemplation': 'meditation',
  'Buddhist Practice':          'meditation',
  'Breathwork & Pranayama':     'breathwork',
  'Shadow Work & Psychology':   'shadow',
  'Movement & Somatic':         'meditation',
  'Contemplative Prayer':       'meditation',
}

function SubjectDetail({ subject, progress, available, masteryStage, subjectNote, studyModeOpen,
  onEnterStudyMode, onExitStudyMode, onComplete, onNavigate, onMastery, onMasteryNote,
  onSetMasteryStage, onSaveNote, tierBadge, onAskGuide, onAskCouncil }) {

  const phaseColour = PHASE_COLOURS[subject.phase]?.colour || '#888'
  const phaseGlyph  = PHASE_COLOURS[subject.phase]?.glyph || '⟟'
  const layerSymbol = LAYER_SYMBOL[subject.layer]
  const layerLabel  = LAYER_LABEL[subject.layer]
  const isComplete  = progress[subject.id]?.status === 'completed'
  const prereqs     = subject.prerequisites || []

  const [studyTab, setStudyTab] = useState('read')
  const [noteText, setNoteText] = useState(subjectNote || '')
  const [noteSaved, setNoteSaved] = useState(true)
  const [reflectQs, setReflectQs] = useState(null)
  const [reflectLoading, setReflectLoading] = useState(false)
  const [reflectAnswers, setReflectAnswers] = useState({})
  const [integrateMode, setIntegrateMode] = useState(false)
  const [integrateText, setIntegrateText] = useState('')

  // Contemplate
  const [contemplateQ, setContemplateQ] = useState(null)
  const [contemplateLoading, setContemplateLoading] = useState(false)
  const [contemplateAnswer, setContemplateAnswer] = useState('')
  const [contemplateTimerSec, setContemplateTimerSec] = useState(0)
  const contemplateTimerRef = useRef(null)

  // Socratic
  const [socraticMessages, setSocraticMessages] = useState([])
  const [socraticInput, setSocraticInput] = useState('')
  const [socraticLoading, setSocraticLoading] = useState(false)

  // Apply
  const [applyQs, setApplyQs] = useState(null)
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyAnswers, setApplyAnswers] = useState({})

  // Connect
  const [connectSuggestions, setConnectSuggestions] = useState(null)
  const [connectLoading, setConnectLoading] = useState(false)

  const articleRef = useRef(null)
  const noteDebounce = useRef(null)

  // Sync state when subject changes
  useEffect(() => {
    setStudyTab('read')
    setNoteText(subjectNote || '')
    setNoteSaved(true)
    setReflectQs(null)
    setReflectAnswers({})
    setIntegrateMode(false)
    setIntegrateText('')
    setContemplateQ(null)
    setContemplateAnswer('')
    setContemplateTimerSec(0)
    clearInterval(contemplateTimerRef.current)
    setSocraticMessages([])
    setSocraticInput('')
    setApplyQs(null)
    setApplyAnswers({})
    setConnectSuggestions(null)
  }, [subject.id])

  // Sync note text when prop updates
  useEffect(() => { setNoteText(subjectNote || '') }, [subjectNote])

  const sectionContent = useMemo(() => extractSubjectSection(subject.name), [subject.name])
  const renderedMd = useMemo(() => {
    const raw = marked.parse(sectionContent || '')
    return linkifySubjects(raw, SUBJECTS, subject.id)
  }, [sectionContent, subject.id])

  // Scroll-to-bottom → advance to STUDIED
  useEffect(() => {
    if (studyTab !== 'read' || !articleRef.current) return
    const el = articleRef.current
    function onScroll() {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80
      if (atBottom && masteryStage < MASTERY_STAGES.STUDIED) {
        onSetMasteryStage(subject.name, MASTERY_STAGES.STUDIED)
      }
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [studyTab, subject.id, masteryStage])

  // Auto-save notes with debounce
  function handleNoteChange(val) {
    setNoteText(val)
    setNoteSaved(false)
    clearTimeout(noteDebounce.current)
    noteDebounce.current = setTimeout(() => {
      onSaveNote(subject.name, val)
      setNoteSaved(true)
    }, 800)
  }

  // Load reflect questions
  async function loadReflectQuestions() {
    if (reflectQs !== null) return
    setReflectLoading(true)
    setReflectQs([])
    try {
      const cached = await getStoreValue(KEYS.REFLECT_QUESTIONS)
      const slug = slugify(subject.name)
      if (cached?.[slug]) {
        setReflectQs(cached[slug])
        setReflectLoading(false)
        return
      }
      // Call AI to generate questions
      const { callAPI } = await import('../../engine/api.js')
      const articleSnippet = sectionContent ? sectionContent.slice(0, 1200) : `Subject: ${subject.name} in the domain of ${subject.domain}.`
      const prompt = `You are a Socratic teacher at a mystery school. A student has just read the following article:\n\n${articleSnippet}\n\nGenerate exactly 3 probing questions that will help the student integrate this teaching into their lived experience. The questions must:\n- Reference specific claims or teachings in the article above\n- Have no obvious answers\n- Require genuine self-reflection, not just recall\n- Be addressed directly to the student (use "you")\n\nReturn ONLY a JSON array of 3 strings. No explanation.`
      const response = await callAPI({ messages: [{ role: 'user', content: prompt }], maxTokens: 400 })
      let questions = []
      try { questions = JSON.parse(response.content.replace(/```json|```/g, '').trim()) } catch {}
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = [
          `What specific aspect of ${subject.name} most directly challenges how you currently live?`,
          `Where in your life do you see the teaching of ${subject.name} already operating — even if you never named it?`,
          `What would change if you took the core insight of ${subject.name} completely seriously for 30 days?`,
        ]
      }
      setReflectQs(questions)
      const updatedCache = { ...(cached || {}), [slug]: questions }
      await setStoreValue(KEYS.REFLECT_QUESTIONS, updatedCache)
    } catch {
      setReflectQs([
        `What specific aspect of ${subject.name} most directly challenges how you currently live?`,
        `Where in your life do you see the teaching of ${subject.name} already operating?`,
        `What would change if you took the core insight of ${subject.name} completely seriously for 30 days?`,
      ])
    }
    setReflectLoading(false)
  }

  useEffect(() => {
    if (studyTab === 'reflect') loadReflectQuestions()
  }, [studyTab])

  // Contemplate — one koan-style question + silence timer
  async function loadContemplateQuestion() {
    if (contemplateQ !== null) return
    setContemplateLoading(true)
    const snippet = sectionContent ? sectionContent.slice(0, 1000) : `${subject.name} in ${subject.domain}`
    try {
      const { callAPI } = await import('../../engine/api.js')
      const res = await callAPI({ messages: [{ role: 'user', content: `You are a contemplative teacher. From this teaching on "${subject.name}":\n\n${snippet}\n\nWrite ONE koan-style question that cannot be answered with knowledge alone — only through sitting with it. Return only the question, no preamble.` }], maxTokens: 120 })
      setContemplateQ(res.content.trim())
    } catch {
      setContemplateQ(`Where in your body do you feel the truth of ${subject.name} — or its absence?`)
    }
    setContemplateLoading(false)
  }

  function startContemplateTimer() {
    clearInterval(contemplateTimerRef.current)
    setContemplateTimerSec(0)
    contemplateTimerRef.current = setInterval(() => setContemplateTimerSec(s => s + 1), 1000)
  }

  useEffect(() => {
    if (studyTab === 'contemplate') loadContemplateQuestion()
    if (studyTab !== 'contemplate') clearInterval(contemplateTimerRef.current)
  }, [studyTab])

  // Socratic — adversarial AI chat
  async function sendSocratic(userMsg) {
    if (!userMsg.trim() || socraticLoading) return
    const next = [...socraticMessages, { role: 'user', content: userMsg }]
    setSocraticMessages(next)
    setSocraticInput('')
    setSocraticLoading(true)
    try {
      const { callAPI } = await import('../../engine/api.js')
      const system = `You are a Socratic teacher specialising in "${subject.name}" (${subject.domain}). Your role: challenge the student's understanding with precision. Never validate easily. Expose assumptions. Ask follow-up questions that require deeper thinking. Be intellectually rigorous but not unkind. Keep responses under 120 words.`
      const res = await callAPI({ systemPrompt: system, messages: next, maxTokens: 200 })
      setSocraticMessages(m => [...m, { role: 'assistant', content: res.content.trim() }])
    } catch {
      setSocraticMessages(m => [...m, { role: 'assistant', content: 'The connection failed. Hold the question yourself for now.' }])
    }
    setSocraticLoading(false)
  }

  useEffect(() => {
    if (studyTab === 'socratic' && socraticMessages.length === 0) {
      const opener = `What do you believe ${subject.name} actually means — in your own words, not the article's?`
      setSocraticMessages([{ role: 'assistant', content: opener }])
    }
  }, [studyTab])

  // Apply — 3 life-application questions
  async function loadApplyQuestions() {
    if (applyQs !== null) return
    setApplyLoading(true)
    const snippet = sectionContent ? sectionContent.slice(0, 800) : subject.name
    try {
      const { callAPI } = await import('../../engine/api.js')
      const res = await callAPI({ messages: [{ role: 'user', content: `You are a depth psychology teacher. From this teaching on "${subject.name}":\n\n${snippet}\n\nGenerate exactly 3 questions that ask the student to locate this teaching in their actual life — not theoretically, but in real, specific situations. Each question must begin with "Where", "When", or "Who". Return ONLY a JSON array of 3 strings.` }], maxTokens: 300 })
      let qs = []
      try { qs = JSON.parse(res.content.replace(/```json|```/g, '').trim()) } catch {}
      if (!Array.isArray(qs) || qs.length < 3) qs = [
        `Where in your current life is ${subject.name} already happening — named or unnamed?`,
        `When have you acted against the principles of ${subject.name}, and what did that cost you?`,
        `Who in your life would most benefit from understanding ${subject.name}, and why?`,
      ]
      setApplyQs(qs)
    } catch {
      setApplyQs([
        `Where in your current life is ${subject.name} already happening — named or unnamed?`,
        `When have you acted against the principles of ${subject.name}, and what did that cost you?`,
        `Who in your life would most benefit from understanding ${subject.name}, and why?`,
      ])
    }
    setApplyLoading(false)
  }

  useEffect(() => {
    if (studyTab === 'apply') loadApplyQuestions()
  }, [studyTab])

  // Connect — find related subjects from completed list
  function buildConnections(completedList) {
    if (connectSuggestions !== null) return
    setConnectLoading(true)
    const allSubjects = [...SUBJECTS, ...UNCOMMON_SUBJECTS, ...VOID_SUBJECTS]
    const related = allSubjects.filter(s =>
      s.id !== subject.id &&
      completedList.includes(s.id) &&
      (s.domain === subject.domain || s.phase === subject.phase || (s.prerequisites || []).includes(subject.id) || (subject.prerequisites || []).includes(s.id))
    ).slice(0, 8)
    setConnectSuggestions(related)
    setConnectLoading(false)
  }

  useEffect(() => {
    if (studyTab === 'connect') buildConnections(Object.keys(progress).filter(k => progress[k]?.status === 'completed'))
  }, [studyTab])

  const practiceType = DOMAIN_PRACTICE_MAP[subject.domain]
  const masteryInfo  = MASTERY_LEVELS[masteryStage]

  // Integrate flow — requires 50 words
  function handleIntegrate() {
    if (integrateText.trim().split(/\s+/).length < 50) return
    onSetMasteryStage(subject.name, MASTERY_STAGES.INTEGRATED)
    onComplete()
    // Save as a journal integration entry via masteryNote
    onMasteryNote(subject.id, integrateText.trim())
    setIntegrateMode(false)
  }

  if (!studyModeOpen) {
    // ─ Compact panel (browser mode) ─
    return (
      <div className="subject-detail">
        {/* Header */}
        <div className="detail-header">
          <div className="detail-meta">
            <span className="detail-layer" style={{ color: phaseColour }}>{layerSymbol} {layerLabel}</span>
            <span className="detail-domain text-dim">{subject.domain}</span>
          </div>
          <h1 className="detail-title font-serif">{subject.name}</h1>
          <div className="detail-tags">
            <span className="tag" style={{ color: phaseColour }}>{phaseGlyph} Phase {subject.phase}</span>
            <span className="tag text-dim">Π {subject.pi}</span>
            <span className="tag text-dim">{subject.lamague}</span>
            {subject.duration && <span className="tag text-dim">{subject.duration} min</span>}
            {tierBadge && <span className="tag tag--rare">{tierBadge}</span>}
            <span className="tag" style={{ color: masteryInfo.colour }}>{masteryInfo.glyph} {masteryInfo.label}</span>
          </div>
        </div>

        {prereqs.length > 0 && (
          <div className="detail-prereqs card">
            <div className="prereq-label text-dim">Prerequisites</div>
            <div className="prereq-list">
              {prereqs.map(id => {
                const s = SUBJECTS.find(x => x.id === id)
                const done = progress[id]?.status === 'completed'
                return (
                  <button key={id} className={`prereq-item ${done ? 'prereq-item--done' : ''}`} onClick={() => onNavigate(id)}>
                    <span>{done ? '✓' : '○'}</span><span>{s?.name || id}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {subject.notes && <div className="detail-notes"><p>{subject.notes}</p></div>}

        <div
          className="detail-article"
          onClick={e => {
            const sid = e.target.closest?.('[data-sid]')?.dataset?.sid
            if (sid) { e.preventDefault(); onNavigate(sid) }
          }}
        >
          {sectionContent ? (
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedMd }} />
          ) : (
            <div className="detail-article-empty">
              <div className="detail-article-empty-glyph font-mono" style={{ color: phaseColour }}>∅</div>
              <p>Full article coming — take it to the Guide in the meantime.</p>
            </div>
          )}
        </div>

        {subject.experiment && (
          <div className="detail-experiment card">
            <div className="experiment-label text-dim font-mono">Experiment Protocol</div>
            <p>{subject.experiment}</p>
          </div>
        )}
        {subject.warning && <div className="detail-warning">⚠️ {subject.warning}</div>}
        {subject.contraindications && (
          <div className="detail-contraindication"><strong>Contraindications:</strong> {subject.contraindications}</div>
        )}
        {subject.threshold && (
          <div className="detail-threshold card">
            <div className="threshold-label text-dim font-mono">Threshold Condition</div>
            <p>{subject.threshold}</p>
          </div>
        )}

        {/* Enter study room CTA */}
        <div className="detail-study-cta">
          <button className="detail-enter-study-btn" style={{ borderColor: phaseColour, color: phaseColour }} onClick={onEnterStudyMode}>
            <span className="font-mono">⟳</span> Enter Study Room
          </button>
        </div>

        <div className="detail-complete-row">
          {!isComplete ? (
            <button className="detail-complete-btn" style={{ borderColor: phaseColour, color: phaseColour }} onClick={onComplete}>
              <span className="font-mono">○</span> Mark Complete
            </button>
          ) : (
            <div className="detail-complete-badge" style={{ borderColor: phaseColour, color: phaseColour }}>
              <span className="font-mono">●</span> Completed
            </div>
          )}
        </div>

        <div className="detail-teacher-btns">
          <button className="detail-teacher-btn" onClick={onAskGuide}><span className="font-mono">⊚</span> Ask the Guide</button>
          <button className="detail-teacher-btn" onClick={onAskCouncil}><span className="font-mono">⊕</span> Take to Council</button>
        </div>
      </div>
    )
  }

  // ─ Full study room (immersive mode) ─
  return (
    <div className="study-room">
      {/* Study room header */}
      <div className="study-room-header">
        <button className="study-room-back" onClick={onExitStudyMode} style={{ color: phaseColour }}>
          ← {subject.name}
        </button>
        <div className="study-room-tabs">
          {STUDY_TABS.map(t => (
            <button
              key={t.id}
              className={`study-room-tab ${studyTab === t.id ? 'study-room-tab--active' : ''}`}
              style={studyTab === t.id ? { borderBottomColor: phaseColour, color: phaseColour } : {}}
              onClick={() => setStudyTab(t.id)}
            >
              <span className="font-mono">{t.glyph}</span> {t.label}
            </button>
          ))}
        </div>
        <div className="study-room-stage" style={{ color: masteryInfo.colour }}>
          <span className="font-mono">{masteryInfo.glyph}</span> {masteryInfo.label}
        </div>
      </div>

      {/* READ tab */}
      {studyTab === 'read' && (
        <div className="study-room-body" ref={articleRef}>
          <div className="study-room-read">
            <div className="study-room-read-meta">
              <span style={{ color: phaseColour }}>{layerSymbol} {layerLabel}</span>
              <span className="text-dim">·</span>
              <span className="text-dim">{subject.domain}</span>
              <span className="text-dim">·</span>
              <span style={{ color: phaseColour }}>{phaseGlyph} Phase {subject.phase}</span>
            </div>
            <h1 className="study-room-title font-serif">{subject.name}</h1>
            {subject.notes && <p className="study-room-subtitle text-dim">{subject.notes}</p>}

            {sectionContent ? (
              <div className="study-room-article markdown-body" dangerouslySetInnerHTML={{ __html: renderedMd }} />
            ) : (
              <div className="detail-article-empty">
                <div className="detail-article-empty-glyph font-mono" style={{ color: phaseColour }}>∅</div>
                <p>Full article coming. Proceed to Reflect or take it to the Guide.</p>
              </div>
            )}

            {subject.experiment && (
              <div className="detail-experiment card" style={{ marginTop: 32 }}>
                <div className="experiment-label text-dim font-mono">Experiment Protocol</div>
                <p>{subject.experiment}</p>
              </div>
            )}
            {subject.warning && <div className="detail-warning" style={{ marginTop: 16 }}>⚠️ {subject.warning}</div>}
            {subject.contraindications && (
              <div className="detail-contraindication" style={{ marginTop: 12 }}>
                <strong>Contraindications:</strong> {subject.contraindications}
              </div>
            )}
            {subject.threshold && (
              <div className="detail-threshold card" style={{ marginTop: 16 }}>
                <div className="threshold-label text-dim font-mono">Threshold Condition</div>
                <p>{subject.threshold}</p>
              </div>
            )}

            {/* Bottom action row */}
            <div className="study-room-bottom-actions">
              {!isComplete ? (
                <button className="detail-complete-btn" style={{ borderColor: phaseColour, color: phaseColour }} onClick={onComplete}>
                  <span className="font-mono">○</span> Mark Complete
                </button>
              ) : masteryStage < MASTERY_STAGES.INTEGRATED ? (
                !integrateMode ? (
                  <button className="study-room-integrate-btn" style={{ borderColor: '#6BAA80', color: '#6BAA80' }} onClick={() => setIntegrateMode(true)}>
                    <span className="font-mono">⊕</span> Mark Integrated
                  </button>
                ) : (
                  <div className="study-room-integrate-block">
                    <p className="text-dim" style={{ marginBottom: 8, fontSize: 13 }}>
                      Integration requires reflection. Write at least 50 words: what has shifted? Where does this live in you now?
                    </p>
                    <textarea
                      className="mastery-note-textarea"
                      placeholder="In your own words — what has this changed in how you see or live?"
                      value={integrateText}
                      onChange={e => setIntegrateText(e.target.value)}
                      rows={5}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 13, padding: '7px 18px', opacity: integrateText.trim().split(/\s+/).length >= 50 ? 1 : 0.4 }}
                        disabled={integrateText.trim().split(/\s+/).length < 50}
                        onClick={handleIntegrate}
                      >Confirm Integration</button>
                      <span className="text-dim" style={{ fontSize: 12 }}>
                        {integrateText.trim().split(/\s+/).filter(Boolean).length} / 50 words
                      </span>
                      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setIntegrateMode(false)}>Cancel</button>
                    </div>
                  </div>
                )
              ) : (
                <div className="detail-complete-badge" style={{ borderColor: '#6BAA80', color: '#6BAA80' }}>
                  <span className="font-mono">⊕</span> Integrated
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="detail-teacher-btn" onClick={onAskGuide}><span className="font-mono">⊚</span> Ask Guide</button>
                <button className="detail-teacher-btn" onClick={onAskCouncil}><span className="font-mono">⊕</span> Council</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFLECT tab */}
      {studyTab === 'reflect' && (
        <div className="study-room-body">
          <div className="study-room-reflect">
            <h2 className="study-room-section-title font-serif">Reflection</h2>
            <p className="text-dim" style={{ marginBottom: 28, fontSize: 14 }}>
              These questions were generated from the article. There are no correct answers — only honest ones.
            </p>
            {reflectLoading && (
              <div className="study-room-loading">
                <span className="font-mono" style={{ color: phaseColour }}>◎</span>
                <span className="text-dim"> Generating questions from the article…</span>
              </div>
            )}
            {reflectQs && reflectQs.length > 0 && reflectQs.map((q, i) => (
              <div key={i} className="reflect-question-block">
                <div className="reflect-q-label text-dim font-mono" style={{ color: phaseColour }}>Q{i + 1}</div>
                <p className="reflect-q-text">{q}</p>
                <textarea
                  className="reflect-answer-textarea"
                  placeholder="Your response…"
                  value={reflectAnswers[i] || ''}
                  onChange={e => setReflectAnswers(a => ({ ...a, [i]: e.target.value }))}
                  rows={4}
                />
              </div>
            ))}
            {reflectQs && reflectQs.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <button
                  className="detail-teacher-btn"
                  onClick={() => {
                    const combined = reflectQs.map((q, i) => `Q: ${q}\nA: ${reflectAnswers[i] || '(no response)'}`).join('\n\n')
                    onAskGuide && onAskGuide(`I've been reflecting on ${subject.name}. Here are my responses:\n\n${combined}`)
                  }}
                >
                  <span className="font-mono">⊚</span> Take reflections to Guide
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRACTICE tab */}
      {studyTab === 'practice' && (
        <div className="study-room-body">
          <div className="study-room-practice">
            <h2 className="study-room-section-title font-serif">Practice</h2>
            {practiceType ? (
              <>
                <p className="text-dim" style={{ marginBottom: 24, fontSize: 14 }}>
                  This subject has a direct practice. Begin a session — it will be tagged to {subject.name}.
                </p>
                <button
                  className="study-room-practice-btn"
                  style={{ borderColor: phaseColour, color: phaseColour }}
                  onClick={() => {
                    onSetMasteryStage(subject.name, Math.max(masteryStage, MASTERY_STAGES.PRACTICED))
                    onAskGuide && onAskGuide(`I'm about to begin a ${subject.name} practice session. Give me a brief orientation and intention to carry in.`)
                  }}
                >
                  <span className="font-mono">⟳</span> Begin {subject.name} Practice
                </button>
                <p className="text-dim" style={{ marginTop: 20, fontSize: 13 }}>
                  After completing, return here and mark your stage as Practiced to track your progression.
                </p>
                <button
                  className="detail-complete-btn"
                  style={{ marginTop: 16, borderColor: '#C9A84C', color: '#C9A84C' }}
                  onClick={() => onSetMasteryStage(subject.name, Math.max(masteryStage, MASTERY_STAGES.PRACTICED))}
                >
                  <span className="font-mono">●</span> Mark as Practiced
                </button>
              </>
            ) : (
              <>
                <p className="text-dim" style={{ marginBottom: 24, fontSize: 14 }}>
                  This subject doesn't map to a single practice type. Take it to the Guide or Council to design a practice approach.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="detail-teacher-btn" onClick={onAskGuide}>
                    <span className="font-mono">⊚</span> Design a practice with Guide
                  </button>
                  <button className="detail-teacher-btn" onClick={onAskCouncil}>
                    <span className="font-mono">⊕</span> Bring to Council
                  </button>
                </div>
                <button
                  className="detail-complete-btn"
                  style={{ marginTop: 20, borderColor: '#C9A84C', color: '#C9A84C' }}
                  onClick={() => onSetMasteryStage(subject.name, Math.max(masteryStage, MASTERY_STAGES.PRACTICED))}
                >
                  <span className="font-mono">●</span> I've practiced this — mark as Practiced
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTEMPLATE tab */}
      {studyTab === 'contemplate' && (
        <div className="study-room-body">
          <div className="study-room-guided">
            <h2 className="study-room-section-title font-serif">Contemplation</h2>
            <p className="text-dim" style={{ marginBottom: 28, fontSize: 14 }}>
              One question. Sit with it before writing. Let it open rather than close.
            </p>
            {contemplateLoading && (
              <div className="study-room-loading">
                <span className="font-mono" style={{ color: phaseColour }}>∴</span>
                <span className="text-dim"> Forming the question…</span>
              </div>
            )}
            {contemplateQ && (
              <>
                <div className="guided-koan" style={{ borderColor: phaseColour }}>
                  <p className="guided-koan-text font-serif">{contemplateQ}</p>
                </div>
                <div className="guided-timer-row">
                  {contemplateTimerSec === 0 ? (
                    <button className="guided-timer-btn" style={{ borderColor: phaseColour, color: phaseColour }} onClick={startContemplateTimer}>
                      <span className="font-mono">◎</span> Begin silence
                    </button>
                  ) : (
                    <span className="guided-timer-display font-mono" style={{ color: phaseColour }}>
                      {String(Math.floor(contemplateTimerSec / 60)).padStart(2,'0')}:{String(contemplateTimerSec % 60).padStart(2,'0')}
                    </span>
                  )}
                </div>
                <textarea
                  className="guided-answer-textarea"
                  placeholder="When you're ready — write whatever emerged…"
                  value={contemplateAnswer}
                  onChange={e => setContemplateAnswer(e.target.value)}
                  rows={6}
                />
                {contemplateAnswer.trim().length > 0 && (
                  <button className="detail-teacher-btn" style={{ marginTop: 12 }} onClick={() => onAskGuide?.(`I've been contemplating "${subject.name}". The question was:\n\n${contemplateQ}\n\nWhat emerged:\n\n${contemplateAnswer}`)}>
                    <span className="font-mono">⊚</span> Bring to Guide
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SOCRATIC tab */}
      {studyTab === 'socratic' && (
        <div className="study-room-body">
          <div className="study-room-guided study-room-socratic">
            <h2 className="study-room-section-title font-serif">Socratic Dialogue</h2>
            <p className="text-dim" style={{ marginBottom: 20, fontSize: 14 }}>
              The teacher challenges what you think you know. Defend your understanding.
            </p>
            <div className="socratic-thread">
              {socraticMessages.map((m, i) => (
                <div key={i} className={`socratic-msg socratic-msg--${m.role}`}>
                  <span className="socratic-msg-role font-mono text-dim">{m.role === 'assistant' ? 'Teacher' : 'You'}</span>
                  <p className="socratic-msg-text">{m.content}</p>
                </div>
              ))}
              {socraticLoading && (
                <div className="socratic-msg socratic-msg--assistant">
                  <span className="socratic-msg-role font-mono text-dim">Teacher</span>
                  <p className="socratic-msg-text text-dim">…</p>
                </div>
              )}
            </div>
            <div className="socratic-input-row">
              <textarea
                className="socratic-input"
                placeholder="Your response…"
                value={socraticInput}
                onChange={e => setSocraticInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSocratic(socraticInput) } }}
                rows={2}
                disabled={socraticLoading}
              />
              <button
                className="socratic-send-btn"
                style={{ borderColor: phaseColour, color: phaseColour }}
                onClick={() => sendSocratic(socraticInput)}
                disabled={!socraticInput.trim() || socraticLoading}
              >→</button>
            </div>
            <p className="text-dim" style={{ fontSize: 11, marginTop: 6 }}>Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}

      {/* APPLY tab */}
      {studyTab === 'apply' && (
        <div className="study-room-body">
          <div className="study-room-guided">
            <h2 className="study-room-section-title font-serif">Application</h2>
            <p className="text-dim" style={{ marginBottom: 28, fontSize: 14 }}>
              Knowledge without location is theory. Find where this lives in your actual life.
            </p>
            {applyLoading && (
              <div className="study-room-loading">
                <span className="font-mono" style={{ color: phaseColour }}>⊕</span>
                <span className="text-dim"> Grounding the teaching in life…</span>
              </div>
            )}
            {applyQs && applyQs.map((q, i) => (
              <div key={i} className="reflect-question-block">
                <div className="reflect-q-label text-dim font-mono" style={{ color: phaseColour }}>A{i + 1}</div>
                <p className="reflect-q-text">{q}</p>
                <textarea
                  className="reflect-answer-textarea"
                  placeholder="Be specific. A real situation, not a general answer…"
                  value={applyAnswers[i] || ''}
                  onChange={e => setApplyAnswers(a => ({ ...a, [i]: e.target.value }))}
                  rows={4}
                />
              </div>
            ))}
            {applyQs && Object.values(applyAnswers).some(a => a.trim().length > 20) && (
              <button className="detail-teacher-btn" style={{ marginTop: 8 }} onClick={() => {
                const combined = applyQs.map((q, i) => `Q: ${q}\nA: ${applyAnswers[i] || '(blank)'}`).join('\n\n')
                onAskGuide?.(`I'm applying the teaching of "${subject.name}" to my life:\n\n${combined}`)
              }}>
                <span className="font-mono">⊚</span> Bring to Guide
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONNECT tab */}
      {studyTab === 'connect' && (
        <div className="study-room-body">
          <div className="study-room-guided">
            <h2 className="study-room-section-title font-serif">Connections</h2>
            <p className="text-dim" style={{ marginBottom: 24, fontSize: 14 }}>
              Subjects you've completed that share domain, phase, or prerequisite lineage with {subject.name}.
            </p>
            {connectLoading && (
              <div className="study-room-loading">
                <span className="font-mono" style={{ color: phaseColour }}>⟡</span>
                <span className="text-dim"> Mapping connections…</span>
              </div>
            )}
            {connectSuggestions && connectSuggestions.length === 0 && (
              <p className="text-dim" style={{ fontStyle: 'italic' }}>
                Complete more subjects to see connections. Return here as your map grows.
              </p>
            )}
            {connectSuggestions && connectSuggestions.length > 0 && (
              <>
                <div className="connect-list">
                  {connectSuggestions.map(s => {
                    const info = PHASE_COLOURS[s.phase]
                    const reasons = []
                    if (s.domain === subject.domain) reasons.push('same domain')
                    if (s.phase === subject.phase) reasons.push('same phase')
                    if ((s.prerequisites || []).includes(subject.id)) reasons.push('unlocked by this')
                    if ((subject.prerequisites || []).includes(s.id)) reasons.push('prerequisite')
                    return (
                      <div key={s.id} className="connect-row">
                        <span className="connect-glyph font-mono" style={{ color: info?.colour }}>{info?.glyph || '⟟'}</span>
                        <div className="connect-info">
                          <div className="connect-name">{s.name}</div>
                          <div className="connect-reason text-dim">{reasons.join(' · ')}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="detail-teacher-btn" style={{ marginTop: 16 }} onClick={() => {
                  const list = connectSuggestions.map(s => s.name).join(', ')
                  onAskGuide?.(`I've studied both "${subject.name}" and these related subjects: ${list}. Can you synthesize the deeper connections between them?`)
                }}>
                  <span className="font-mono">⊚</span> Ask Guide to synthesize these connections
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* NOTES tab */}
      {studyTab === 'notes' && (
        <div className="study-room-body">
          <div className="study-room-notes">
            <div className="study-room-notes-header">
              <h2 className="study-room-section-title font-serif">Your Notes</h2>
              <span className="text-dim" style={{ fontSize: 12 }}>{noteSaved ? '✓ saved' : 'saving…'}</span>
            </div>
            <p className="text-dim" style={{ marginBottom: 16, fontSize: 13 }}>
              Private. Auto-saved. Your working margin for this subject.
            </p>
            <textarea
              className="study-room-notes-textarea"
              placeholder={`Notes on ${subject.name}…`}
              value={noteText}
              onChange={e => handleNoteChange(e.target.value)}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
              {noteText.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Classroom detail ─────────────────────────────────────────────────────────

function ClassroomDetail({ classroom, progress, completedIds, available, masteryStages = {}, onNavigate }) {
  const prog = getClassroomProgress(classroom.id, completedIds)
  const nextId = getNextSubjectInClassroom(classroom.id, completedIds)
  const [sigilSvg, setSigilSvg] = React.useState(null)
  const [isInitiated, setIsInitiated] = React.useState(false)

  React.useEffect(() => {
    getStoreValue(KEYS.INITIATION_SIGILS).then(sigils => {
      if (sigils?.[classroom.id]) {
        setSigilSvg(sigils[classroom.id].sigil)
        setIsInitiated(true)
      }
    })
  }, [classroom.id])

  return (
    <div className="classroom-detail">
      {/* Initiation sigil banner */}
      {isInitiated && sigilSvg && (
        <div className="classroom-initiated-banner">
          <div
            className="classroom-initiated-sigil"
            dangerouslySetInnerHTML={{ __html: sigilSvg }}
          />
          <span className="classroom-initiated-label text-dim">Initiated</span>
        </div>
      )}
      {/* Header */}
      <div className="classroom-detail-header">
        <span className="classroom-detail-glyph font-mono" style={{ color: classroom.colour }}>
          {classroom.glyph}
        </span>
        <div>
          <div className="classroom-detail-badge text-dim" style={{ color: classroom.colour }}>
            {classroom.difficulty} · {classroom.estimatedHours}h
          </div>
          <h1 className="classroom-detail-title font-serif">{classroom.name}</h1>
          <p className="classroom-detail-tagline text-dim">{classroom.tagline}</p>
        </div>
      </div>

      {/* Warning */}
      {classroom.warning && (
        <div className="detail-warning">⚠️ {classroom.warning}</div>
      )}

      {/* Description */}
      <p className="classroom-description">{classroom.description}</p>

      {/* Progress bar */}
      <div className="classroom-detail-progress">
        <div className="classroom-detail-progress-bar">
          <div
            className="classroom-detail-progress-fill"
            style={{ width: `${prog.pct}%`, background: classroom.colour }}
          />
        </div>
        <div className="classroom-detail-progress-stats text-dim">
          {prog.completed} of {prog.total} complete · {prog.pct}%
        </div>
      </div>

      {/* Next subject CTA */}
      {nextId && (
        <button
          className="btn-primary classroom-next-btn"
          style={{ background: classroom.colour, borderColor: classroom.colour }}
          onClick={() => onNavigate(nextId)}
        >
          {prog.completed === 0 ? 'Begin Path' : 'Continue'} →{' '}
          {SUBJECTS.find(s => s.id === nextId)?.name || nextId}
        </button>
      )}
      {!nextId && prog.total > 0 && (
        <div className="complete-badge" style={{ borderColor: classroom.colour, color: classroom.colour }}>
          ✓ Path Complete
        </div>
      )}

      {/* Subject sequence */}
      <div className="classroom-subjects">
        <div className="content-label text-dim font-mono">Curriculum — {prog.total} subjects</div>
        <div className="classroom-subject-list">
          {classroom.subjects.map((id, idx) => {
            const s = SUBJECTS.find(x => x.id === id)
            const done = completedIds.includes(id)
            const isAvail = available.has(id)
            const isCurrent = id === nextId
            return (
              <button
                key={id}
                className={`classroom-subject-row ${done ? 'classroom-subject-row--done' : ''} ${isCurrent ? 'classroom-subject-row--current' : ''} ${!isAvail && !done ? 'classroom-subject-row--locked' : ''}`}
                onClick={() => (isAvail || done) && onNavigate(id)}
                style={isCurrent ? { borderLeftColor: classroom.colour } : {}}
              >
                <span className="classroom-subject-num font-mono text-dim">{String(idx + 1).padStart(2, '0')}</span>
                <span className="classroom-subject-name">{s?.name || id}</span>
                <span className="classroom-subject-status">
                  {done && <span style={{ color: classroom.colour }}>✓</span>}
                  {!done && !isAvail && <span className="text-dim">🔒</span>}
                  {!done && isAvail && s && <span className="text-dim font-mono" style={{ fontSize: 10 }}>Π{s.pi}</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Extract the section for a subject from the catalogue
function extractSubjectSection(subjectName) {
  const lines = SUBJECT_CATALOGUE.split('\n')
  const nameClean = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '')
  let start = -1
  let end = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineClean = line.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (start === -1 && lineClean.includes(nameClean)) {
      start = i
      continue
    }
    // Next subject header (starts with ###) ends the section
    if (start !== -1 && line.startsWith('###') && i > start + 1) {
      end = i
      break
    }
  }

  if (start === -1) return ''
  return lines.slice(start, end === -1 ? start + 80 : end).join('\n')
}

// ─── Locked room state ────────────────────────────────────────────────────────

function LockedRoomState({ unlockProg }) {
  return (
    <div className="uncommon-locked">
      <span className="uncommon-locked-glyph font-mono">◬</span>
      <div className="uncommon-locked-title">The Uncommon Room</div>
      <p className="text-dim uncommon-locked-desc">
        35 subjects from the hidden curriculum. Disciplines that fell outside
        mainstream practice but proved their worth.
      </p>
      <div className="uncommon-locked-condition">
        <div className="text-dim font-mono uncommon-locked-label">Unlock condition</div>
        <p className="uncommon-locked-req">
          {unlockProg.threshold} subjects at Practising or Integrated mastery
        </p>
        <div className="uncommon-lock-bar">
          <div
            className="uncommon-lock-fill"
            style={{ width: `${unlockProg.pct}%` }}
          />
        </div>
        <div className="uncommon-lock-count font-mono text-dim">
          {unlockProg.count} / {unlockProg.threshold}
        </div>
      </div>
      <p className="text-dim uncommon-locked-alt">
        Or find the spiral path in the Journey view.
      </p>
    </div>
  )
}

// ─── Uncommon room list ───────────────────────────────────────────────────────

function UncommonRoomList({ subjects, domains, progress, available, selected, onSelect }) {
  const domainMap = domains  // { domainName: { glyph, colour, desc } }
  const [activeDomain, setActiveDomain] = useState(null)

  const domainNames = useMemo(() => Object.keys(domainMap), [domainMap])

  const byDomain = useMemo(() => {
    const map = {}
    subjects.forEach(s => {
      if (!map[s.domain]) map[s.domain] = []
      map[s.domain].push(s)
    })
    return map
  }, [subjects])

  // Auto-select first domain
  useEffect(() => {
    if (!activeDomain && domainNames.length > 0) setActiveDomain(domainNames[0])
  }, [domainNames])

  const domainSubjects = useMemo(() => byDomain[activeDomain] || [], [byDomain, activeDomain])
  const completedCount = subjects.filter(s => progress[s.id]?.mastery > 0).length

  return (
    <div className="study-browser">
      {/* Domain column */}
      <div className="domain-column">
        <div className="domain-column-header">
          <span className="font-mono" style={{ color: '#C9A84C', fontSize: 13 }}>◬</span>
          <span className="text-dim" style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 }}>
            {completedCount}/{subjects.length}
          </span>
        </div>
        <div className="domain-list">
          {domainNames.map(domainName => {
            const dom = domainMap[domainName]
            const subs = byDomain[domainName] || []
            const withMastery = subs.filter(s => (progress[s.id]?.mastery || 0) > 0).length
            const mastPct = subs.length > 0 ? withMastery / subs.length : 0
            const dotColor = mastPct === 0 ? 'var(--border)' : mastPct < 0.5 ? '#C9A84C' : '#6BAA80'
            return (
              <button
                key={domainName}
                className={`domain-item ${activeDomain === domainName ? 'domain-item--active' : ''}`}
                onClick={() => setActiveDomain(domainName)}
              >
                <span className="domain-item-name">{domainName}</span>
                <span className="domain-item-count">{subs.length}</span>
                <span className="domain-item-dot" style={{ background: dotColor }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Subject column */}
      <div className="subject-column">
        {activeDomain ? (
          <>
            <div className="subject-column-header">
              <span className="subject-column-title" style={{ color: domainMap[activeDomain]?.colour }}>
                {domainMap[activeDomain]?.glyph} {activeDomain}
              </span>
              <span className="text-dim" style={{ fontSize: 11 }}>{domainSubjects.length}</span>
            </div>
            <div className="subject-list">
              {domainSubjects.map(s => {
                const isAvail = available.has(s.id)
                const mastery = progress[s.id]?.mastery || 0
                const ml = MASTERY_LEVELS[mastery]
                const isSelected = selected?.data?.id === s.id
                return (
                  <button
                    key={s.id}
                    className={`subject-row subject-row--rare ${isSelected ? 'subject-row--active' : ''} ${!isAvail ? 'subject-row--locked' : ''}`}
                    onClick={() => isAvail && onSelect(s)}
                  >
                    <span className="subject-layer font-mono" style={{ color: domainMap[s.domain]?.colour || '#C9A84C', fontSize: 11 }}>◬</span>
                    <span className="subject-name">{s.name}</span>
                    <span className="subject-meta">
                      {!isAvail && <span className="status-locked text-dim">🔒</span>}
                      {isAvail && <span className="subject-mastery font-mono" style={{ color: ml.colour, fontSize: 13 }}>{ml.glyph}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="subject-column-empty">Select a domain</div>
        )}
      </div>
    </div>
  )
}

// ─── Locked void state ────────────────────────────────────────────────────────

function LockedVoidState({ voidUnlockProg }) {
  return (
    <div className="void-locked">
      <span className="void-locked-glyph font-mono">⊗</span>
      <div className="void-locked-title">The Void Room</div>
      <p className="text-dim void-locked-desc">
        40 subjects at the edge of what can be taught. Convergence curriculum.
        Not a beginning — a destination that requires the path.
      </p>

      <div className="void-locked-conditions">
        {/* Condition 1: uncommon subjects */}
        <div className="void-locked-condition">
          <div className="text-dim font-mono void-locked-label">Condition I</div>
          <p className="void-locked-req">
            {voidUnlockProg.uncommon.threshold} uncommon subjects at Reading or above
          </p>
          <div className="void-lock-bar">
            <div
              className="void-lock-fill"
              style={{ width: `${voidUnlockProg.uncommon.pct}%` }}
            />
          </div>
          <div className="void-lock-count font-mono text-dim">
            {voidUnlockProg.uncommon.count} / {voidUnlockProg.uncommon.threshold}
          </div>
        </div>

        {/* Condition 2: main subjects */}
        <div className="void-locked-condition">
          <div className="text-dim font-mono void-locked-label">Condition II</div>
          <p className="void-locked-req">
            {voidUnlockProg.main.threshold} main subjects at Practising or Integrated
          </p>
          <div className="void-lock-bar">
            <div
              className="void-lock-fill"
              style={{ width: `${voidUnlockProg.main.pct}%` }}
            />
          </div>
          <div className="void-lock-count font-mono text-dim">
            {voidUnlockProg.main.count} / {voidUnlockProg.main.threshold}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Void room list ───────────────────────────────────────────────────────────

function VoidRoomList({ subjects, domains, progress, available, selected, onSelect }) {
  const domainMap = domains  // { domainName: { glyph, colour, desc } }
  const [activeDomain, setActiveDomain] = useState(null)

  const domainNames = useMemo(() => Object.keys(domainMap), [domainMap])

  const byDomain = useMemo(() => {
    const map = {}
    subjects.forEach(s => {
      if (!map[s.domain]) map[s.domain] = []
      map[s.domain].push(s)
    })
    return map
  }, [subjects])

  // Auto-select first domain
  useEffect(() => {
    if (!activeDomain && domainNames.length > 0) setActiveDomain(domainNames[0])
  }, [domainNames])

  const domainSubjects = useMemo(() => byDomain[activeDomain] || [], [byDomain, activeDomain])
  const completedCount = subjects.filter(s => (progress[s.id]?.mastery || 0) > 0).length

  return (
    <div className="study-browser">
      {/* Domain column */}
      <div className="domain-column">
        <div className="domain-column-header">
          <span className="font-mono" style={{ color: '#6B5080', fontSize: 13 }}>⊗</span>
          <span className="text-dim" style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 }}>
            {completedCount}/{subjects.length}
          </span>
        </div>
        <div className="domain-list">
          {domainNames.map(domainName => {
            const dom = domainMap[domainName]
            const subs = byDomain[domainName] || []
            const withMastery = subs.filter(s => (progress[s.id]?.mastery || 0) > 0).length
            const mastPct = subs.length > 0 ? withMastery / subs.length : 0
            const dotColor = mastPct === 0 ? 'var(--border)' : mastPct < 0.5 ? '#6B5080' : '#6BAA80'
            return (
              <button
                key={domainName}
                className={`domain-item ${activeDomain === domainName ? 'domain-item--active' : ''}`}
                onClick={() => setActiveDomain(domainName)}
              >
                <span className="domain-item-name">{domainName}</span>
                <span className="domain-item-count">{subs.length}</span>
                <span className="domain-item-dot" style={{ background: dotColor }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Subject column */}
      <div className="subject-column">
        {activeDomain ? (
          <>
            <div className="subject-column-header">
              <span className="subject-column-title" style={{ color: domainMap[activeDomain]?.colour }}>
                {domainMap[activeDomain]?.glyph} {activeDomain}
              </span>
              <span className="text-dim" style={{ fontSize: 11 }}>{domainSubjects.length}</span>
            </div>
            <div className="subject-list">
              {domainSubjects.map(s => {
                const isAvail = available.has(s.id)
                const mastery = progress[s.id]?.mastery || 0
                const ml = MASTERY_LEVELS[mastery]
                const isSelected = selected?.data?.id === s.id
                return (
                  <button
                    key={s.id}
                    className={`subject-row subject-row--void ${isSelected ? 'subject-row--active' : ''} ${!isAvail ? 'subject-row--locked' : ''}`}
                    onClick={() => isAvail && onSelect(s)}
                  >
                    <span className="subject-layer font-mono" style={{ color: domainMap[s.domain]?.colour || '#6B5080', fontSize: 11 }}>⊗</span>
                    <span className="subject-name">{s.name}</span>
                    <span className="subject-meta">
                      {!isAvail && <span className="status-locked text-dim">🔒</span>}
                      {isAvail && <span className="subject-mastery font-mono" style={{ color: ml.colour, fontSize: 13 }}>{ml.glyph}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="subject-column-empty">Select a domain</div>
        )}
      </div>
    </div>
  )
}

// ─── Doc reader ───────────────────────────────────────────────────────────────

function DocReader({ doc }) {
  const html = useMemo(() => marked.parse(doc.content || ''), [doc.content])

  return (
    <div className="doc-reader">
      <div className="doc-header">
        <span className="doc-glyph font-mono">{doc.glyph}</span>
        <h1 className="doc-title font-serif">{doc.title}</h1>
      </div>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

// ─── User Classroom Detail ────────────────────────────────────────────────────

function UserClassroomDetail({ classroom, progress, completedIds, available, onNavigate, onDelete, onEdit }) {
  const total = classroom.subjects.length
  const completed = classroom.subjects.filter(id => completedIds.includes(id)).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const nextId = classroom.subjects.find(id => !completedIds.includes(id)) || null
  const [confirming, setConfirming] = useState(false)

  function exportPath() {
    const data = JSON.stringify(classroom, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `path-${classroom.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="classroom-detail">
      <div className="classroom-detail-header">
        <span className="classroom-detail-glyph font-mono" style={{ color: classroom.colour }}>
          {classroom.glyph}
        </span>
        <div>
          <div className="classroom-detail-badge text-dim" style={{ color: classroom.colour }}>
            Your Path · {total} subjects
          </div>
          <h1 className="classroom-detail-title font-serif">{classroom.name}</h1>
          {classroom.tagline && (
            <p className="classroom-detail-tagline text-dim">{classroom.tagline}</p>
          )}
        </div>
      </div>

      <div className="classroom-detail-progress">
        <div className="classroom-detail-progress-bar">
          <div className="classroom-detail-progress-fill" style={{ width: `${pct}%`, background: classroom.colour }} />
        </div>
        <div className="classroom-detail-progress-stats text-dim">
          {completed} of {total} complete · {pct}%
        </div>
      </div>

      {nextId && (
        <button
          className="btn-primary classroom-next-btn"
          style={{ background: classroom.colour, borderColor: classroom.colour }}
          onClick={() => onNavigate(nextId)}
        >
          {completed === 0 ? 'Begin Path' : 'Continue'} →{' '}
          {SUBJECTS.find(s => s.id === nextId)?.name || nextId}
        </button>
      )}
      {!nextId && total > 0 && (
        <div className="complete-badge" style={{ borderColor: classroom.colour, color: classroom.colour }}>
          ✓ Path Complete
        </div>
      )}

      <div className="classroom-subjects">
        <div className="content-label text-dim font-mono">Curriculum — {total} subjects</div>
        <div className="classroom-subject-list">
          {classroom.subjects.map((id, idx) => {
            const s = SUBJECTS.find(x => x.id === id)
            const done = completedIds.includes(id)
            const isAvail = available.has(id)
            const isCurrent = id === nextId
            return (
              <button
                key={id}
                className={`classroom-subject-row ${done ? 'classroom-subject-row--done' : ''} ${isCurrent ? 'classroom-subject-row--current' : ''} ${!isAvail && !done ? 'classroom-subject-row--locked' : ''}`}
                onClick={() => (isAvail || done) && onNavigate(id)}
                style={isCurrent ? { borderLeftColor: classroom.colour } : {}}
              >
                <span className="classroom-subject-num text-dim">{idx + 1}</span>
                <span className="classroom-subject-name">{s?.name || id}</span>
                <span className="classroom-subject-status">
                  {done ? <span style={{ color: classroom.colour }}>✓</span> : (isCurrent ? '→' : '')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="user-path-actions">
        <button className="btn-ghost" onClick={exportPath}>↓ Export Path</button>
        {!confirming ? (
          <button className="btn-ghost user-path-delete" onClick={() => setConfirming(true)}>Delete Path</button>
        ) : (
          <div className="user-path-confirm">
            <span className="text-dim">Delete "{classroom.name}"?</span>
            <button className="btn-ghost user-path-delete" onClick={onDelete}>Confirm</button>
            <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Command Palette ──────────────────────────────────────────────────────────

function CommandPalette({ onClose, onSelect, progress, available, uncommonAvailable, voidAvailable, roomUnlocked, voidUnlocked }) {
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const allSubjects = useMemo(() => {
    const main = SUBJECTS.map(s => ({ ...s, _tier: 'main' }))
    const uncommon = roomUnlocked ? UNCOMMON_SUBJECTS.map(s => ({ ...s, _tier: 'uncommon' })) : []
    const void_ = voidUnlocked ? VOID_SUBJECTS.map(s => ({ ...s, _tier: 'void' })) : []
    return [...main, ...uncommon, ...void_]
  }, [roomUnlocked, voidUnlocked])

  const totalCount = allSubjects.length

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allSubjects.slice(0, 10)
    return allSubjects.filter(s =>
      s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
    ).slice(0, 14)
  }, [query, allSubjects])

  useEffect(() => { setHighlighted(0) }, [results])

  function isAvailable(s) {
    if (s._tier === 'uncommon') return uncommonAvailable?.has(s.id)
    if (s._tier === 'void') return voidAvailable?.has(s.id)
    return available.has(s.id)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const s = results[highlighted]
      if (s && isAvailable(s)) onSelect(s)
    }
  }

  const TIER_BADGE = { main: null, uncommon: { label: '◬', color: '#C9A84C' }, void: { label: '⊗', color: '#6B5080' } }

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          placeholder="Search all subjects…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-results">
          {results.length === 0 && (
            <div className="command-palette-empty text-dim">No matches</div>
          )}
          {results.map((s, idx) => {
            const avail = isAvailable(s)
            const mastery = progress[s.id]?.mastery || 0
            const ml = MASTERY_LEVELS[mastery]
            const badge = TIER_BADGE[s._tier]
            return (
              <button
                key={s.id}
                className={`command-palette-item ${idx === highlighted ? 'command-palette-item--highlighted' : ''} ${!avail ? 'command-palette-item--locked' : ''}`}
                onClick={() => avail && onSelect(s)}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <span className="cp-domain text-dim">{s.domain}</span>
                <span className="cp-name">{s.name}</span>
                {badge && <span className="cp-tier-badge font-mono" style={{ color: badge.color, fontSize: 11 }}>{badge.label}</span>}
                {avail
                  ? <span className="cp-mastery font-mono" style={{ color: ml.colour }}>{ml.glyph}</span>
                  : <span className="cp-lock text-dim">🔒</span>
                }
              </button>
            )
          })}
        </div>
        <div className="command-palette-footer text-dim">
          <span>↑↓ navigate · ↵ open · Esc close</span>
          <span>{totalCount} subjects</span>
        </div>
      </div>
    </div>
  )
}

// ─── Path Creator ─────────────────────────────────────────────────────────────

const PATH_COLOURS = [
  '#C8A96E', '#5B8DB8', '#9B59B6', '#27AE60',
  '#E74C3C', '#F39C12', '#1ABC9C', '#95A5A6',
  '#E91E63', '#607D8B',
]
const DEFAULT_GLYPH = '✦'

function PathCreator({ subjects, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [glyph, setGlyph] = useState(DEFAULT_GLYPH)
  const [colour, setColour] = useState(PATH_COLOURS[0])
  const [tagline, setTagline] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([]) // array of subject ids in order

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects
    const q = search.toLowerCase()
    return subjects.filter(s =>
      s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
    )
  }, [subjects, search])

  function toggleSubject(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function moveUp(idx) {
    if (idx === 0) return
    const next = [...selected]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSelected(next)
  }

  function moveDown(idx) {
    if (idx === selected.length - 1) return
    const next = [...selected]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSelected(next)
  }

  function handleSave() {
    if (!name.trim() || selected.length === 0) return
    const uc = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      glyph: glyph || DEFAULT_GLYPH,
      colour,
      tagline: tagline.trim(),
      subjects: selected,
      createdAt: new Date().toISOString(),
      isUserCreated: true,
    }
    onSave(uc)
  }

  return (
    <div className="path-creator">
      <div className="path-creator-header">
        <span className="path-creator-glyph font-mono" style={{ color: colour }}>{glyph || DEFAULT_GLYPH}</span>
        <div>
          <div className="path-creator-label text-dim font-mono">Create New Path</div>
          <h1 className="path-creator-title font-serif">{name || 'Untitled Path'}</h1>
        </div>
      </div>

      <div className="path-creator-form">
        <div className="path-field">
          <label className="path-field-label text-dim">Name</label>
          <input
            className="path-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Custom Path"
            maxLength={60}
          />
        </div>

        <div className="path-field">
          <label className="path-field-label text-dim">Tagline (optional)</label>
          <input
            className="path-input"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="A short description of this path"
            maxLength={100}
          />
        </div>

        <div className="path-row">
          <div className="path-field path-field--glyph">
            <label className="path-field-label text-dim">Glyph</label>
            <input
              className="path-input path-glyph-input font-mono"
              value={glyph}
              onChange={e => setGlyph(e.target.value.slice(-2))}
              placeholder="✦"
              maxLength={2}
            />
          </div>
          <div className="path-field path-field--colour">
            <label className="path-field-label text-dim">Colour</label>
            <div className="path-colour-swatches">
              {PATH_COLOURS.map(c => (
                <button
                  key={c}
                  className={`path-colour-swatch ${c === colour ? 'path-colour-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColour(c)}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="path-creator-subjects">
        <div className="path-subjects-split">
          <div className="path-subjects-left">
            <div className="path-subjects-label text-dim font-mono">Add subjects</div>
            <input
              className="path-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects…"
            />
            <div className="path-subject-pool">
              {filtered.map(s => {
                const isAdded = selected.includes(s.id)
                return (
                  <button
                    key={s.id}
                    className={`path-pool-item ${isAdded ? 'path-pool-item--added' : ''}`}
                    onClick={() => toggleSubject(s.id)}
                  >
                    <span className="path-pool-name">{s.name}</span>
                    <span className="path-pool-domain text-dim">{s.domain}</span>
                    {isAdded && <span className="path-pool-check" style={{ color: colour }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="path-subjects-right">
            <div className="path-subjects-label text-dim font-mono">
              Order ({selected.length} selected)
            </div>
            <div className="path-order-list">
              {selected.length === 0 && (
                <p className="path-order-empty text-dim">No subjects selected yet</p>
              )}
              {selected.map((id, idx) => {
                const s = subjects.find(x => x.id === id)
                return (
                  <div key={id} className="path-order-item">
                    <span className="path-order-num text-dim">{idx + 1}</span>
                    <span className="path-order-name">{s?.name || id}</span>
                    <div className="path-order-controls">
                      <button className="path-order-btn" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
                      <button className="path-order-btn" onClick={() => moveDown(idx)} disabled={idx === selected.length - 1}>↓</button>
                      <button className="path-order-btn path-order-remove" onClick={() => toggleSubject(id)}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="path-creator-actions">
        <button
          className="btn-primary"
          style={{ background: colour, borderColor: colour }}
          onClick={handleSave}
          disabled={!name.trim() || selected.length === 0}
        >
          Create Path
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
