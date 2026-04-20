import React, { useState, useEffect, useMemo, useRef } from 'react'
import { marked } from 'marked'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { SUBJECTS } from '../../data/subjects'
import { KEYS, MASTERY_LEVELS } from '../../data/schema'
import { PHASE_COLOURS } from '../../theme/colours'
import { PROVIDERS, callProvider } from '../../engine/api'
import { SUBJECT_CATALOGUE } from '../curriculum/index'
import './ForgeView.css'

const STAGES = [
  { id: 'read',     glyph: '≡', label: 'Read' },
  { id: 'reflect',  glyph: '◎', label: 'Reflect' },
  { id: 'practice', glyph: 'Ψ', label: 'Practice' },
  { id: 'council',  glyph: '⊕', label: 'Council' },
  { id: 'journal',  glyph: '≋', label: 'Journal' },
  { id: 'master',   glyph: '⊗', label: 'Master' },
]

const DOMAIN_PRACTICE = {
  'Meditation & Contemplative Arts':  { type: 'meditation',  prompt: 'Sit with this subject in stillness. Let it arise without pushing.' },
  'Meditation & Contemplation':       { type: 'meditation',  prompt: 'Sit in open awareness. Let the teaching settle.' },
  'Breathwork & Pranayama':           { type: 'breathwork',  prompt: 'Four-count breath: in for 4, hold 4, out 4, hold 4.' },
  'Shadow Work & Psychology':         { type: 'shadow',      prompt: 'Sit with what is uncomfortable. Do not resolve it — observe it.' },
  'Buddhist Deep Practice':           { type: 'meditation',  prompt: 'Return to the breath. Return to the question. Return to breath.' },
  'Hindu Philosophy & Yoga':          { type: 'meditation',  prompt: 'Sit in the question. Let awareness rest without grasping.' },
  'Movement & Somatic':               { type: 'movement',    prompt: 'Walk slowly. Let the body carry what the mind is holding.' },
  'Taoism & Chinese Wisdom':          { type: 'meditation',  prompt: 'Do nothing. Let the teaching be.' },
  'Christian Mysticism':              { type: 'meditation',  prompt: 'Sit in contemplative silence. Be with, not doing.' },
  'Sufism & Islamic Mysticism':       { type: 'meditation',  prompt: 'Return to the heart. Let the dhikr arise.' },
  'Kabbalah & Tree of Life':          { type: 'meditation',  prompt: 'Hold the symbol. Let its meaning approach from within.' },
  'Sacred Geometry & Mathematics':    { type: 'meditation',  prompt: 'Contemplate the form. Feel its proportions in the body.' },
  'Dream Work':                       { type: 'meditation',  prompt: 'Close the eyes. Let the dream images return and speak.' },
  'Shamanic Arts':                    { type: 'meditation',  prompt: 'Journey inward. Meet what arises.' },
  'Plant Medicine':                   { type: 'meditation',  prompt: 'Sit in reverence. Do not chase. Receive.' },
  'Energy Healing':                   { type: 'meditation',  prompt: 'Bring awareness to the body. Feel where energy moves and where it stops.' },
  'Death Work & Grief':               { type: 'shadow',      prompt: 'Sit with the feeling of ending. Do not hurry through it.' },
  'Sound, Vibration & Cymatics':      { type: 'breathwork',  prompt: 'Hum on the exhale. Feel the vibration in chest and skull.' },
  'Alchemy & Transformation':         { type: 'shadow',      prompt: 'Sit with what in you wants to change. Do not force it.' },
  'AI & Technology':                  { type: 'meditation',  prompt: 'Sit in the question of what intelligence is. Do not answer — hold it.' },
}

const DEFAULT_PRACTICE = { type: 'meditation', prompt: 'Sit in stillness with this subject. Let it speak in its own time.' }

const FORGE_REFLECT_QUESTIONS = [
  (name) => `What assumption were you bringing to ${name} before today? Does the article confirm or challenge it?`,
  (name) => `What is the single most important claim in this teaching about ${name}? What would it take to falsify it?`,
  (name) => `If ${name} were completely true and you lived it for one year, what would change in how you move through the world?`,
]

function extractSubjectSection(subjectName) {
  if (!subjectName || !SUBJECT_CATALOGUE) return ''
  const lines = SUBJECT_CATALOGUE.split('\n')
  const nameClean = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '')
  let start = -1, end = -1
  for (let i = 0; i < lines.length; i++) {
    const lineClean = lines[i].toLowerCase().replace(/[^a-z0-9]/g, '')
    if (start === -1 && lineClean.includes(nameClean)) { start = i; continue }
    if (start !== -1 && lines[i].startsWith('###') && i > start + 1) { end = i; break }
  }
  if (start === -1) return ''
  return lines.slice(start, end === -1 ? start + 80 : end).join('\n')
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ForgeView() {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || state?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#8B7ACC'

  const [subjectId, setSubjectId] = useState(null)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [stageData, setStageData] = useState({})
  const [complete, setComplete] = useState(false)
  const [apiKeys, setApiKeys] = useState({})

  useEffect(() => {
    const providers = Object.values(PROVIDERS)
    Promise.all(providers.map(p => getStoreValue(p.settingsKey).then(k => [p.id, k || ''])))
      .then(pairs => setApiKeys(Object.fromEntries(pairs)))
  }, [])

  const subject = useMemo(() => SUBJECTS.find(s => s.id === subjectId) || null, [subjectId])
  const sectionContent = useMemo(() => subject ? extractSubjectSection(subject.name) : '', [subject])

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return SUBJECTS.slice(0, 40)
    const q = subjectSearch.toLowerCase()
    return SUBJECTS.filter(s => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)).slice(0, 40)
  }, [subjectSearch])

  function advance(data = {}) {
    setStageData(prev => ({ ...prev, [STAGES[stageIdx].id]: data }))
    if (stageIdx < STAGES.length - 1) {
      setStageIdx(i => i + 1)
    } else {
      finishForge(data)
    }
  }

  async function finishForge(masterData) {
    const entry = {
      id: Date.now().toString(),
      subjectId: subject.id,
      subjectName: subject.name,
      completedAt: new Date().toISOString(),
      phase,
      ...stageData,
      master: masterData,
    }
    const existing = await getStoreValue(KEYS.FORGE_ENTRIES) || []
    await setStoreValue(KEYS.FORGE_ENTRIES, [entry, ...existing].slice(0, 100))

    // Save journal entry from forge
    if (entry.journal?.text) {
      const journalEntries = await getStoreValue(KEYS.JOURNAL) || []
      const jEntry = {
        id: Date.now().toString() + '_forge',
        type: 'insight',
        prompt: `The Forge — ${subject.name}`,
        content: entry.journal.text,
        phase,
        depth: state?.depth || 1,
        createdAt: new Date().toISOString(),
        tags: ['forge', subject.domain],
      }
      await setStoreValue(KEYS.JOURNAL, [jEntry, ...journalEntries])
    }

    setComplete(true)
  }

  function restart() {
    setSubjectId(null)
    setSubjectSearch('')
    setStageIdx(0)
    setStageData({})
    setComplete(false)
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (complete && subject) {
    return (
      <div className="forge-complete">
        <div className="forge-complete-glyph font-mono" style={{ color: phaseColour }}>⊕</div>
        <h2 className="forge-complete-title font-serif">The Work is done.</h2>
        <p className="forge-complete-subject" style={{ color: phaseColour }}>{subject.name}</p>
        <p className="forge-complete-desc text-dim">
          You have read, reflected, practised, debated, journalled, and advanced your mastery.<br />
          This is what it means to integrate — not to know it, but to have moved through it.
        </p>
        <div className="forge-complete-stamp font-mono text-dim">
          ⊚ Forged {new Date().toLocaleDateString()}
        </div>
        <button className="btn-primary forge-again-btn" style={{ background: phaseColour, borderColor: phaseColour }} onClick={restart}>
          Forge another subject
        </button>
      </div>
    )
  }

  // ── Subject picker ────────────────────────────────────────────────────────
  if (!subjectId) {
    return (
      <div className="forge-picker-view">
        <div className="forge-picker-header">
          <span className="forge-header-glyph font-mono" style={{ color: phaseColour }}>⊗</span>
          <h1 className="font-serif forge-title">The Forge</h1>
          <p className="text-dim forge-subtitle">
            Six stages. One subject. Read it. Question it. Practise it. Debate it. Journal it. Master it.
          </p>
        </div>

        <div className="forge-picker-box">
          <div className="forge-picker-label text-dim">Choose your subject</div>
          <input
            className="forge-search"
            placeholder="Search subjects…"
            value={subjectSearch}
            autoFocus
            onChange={e => { setSubjectSearch(e.target.value); setShowPicker(true) }}
            onFocus={() => setShowPicker(true)}
          />
          {showPicker && (
            <div className="forge-subject-list">
              {filteredSubjects.map(s => (
                <button
                  key={s.id}
                  className="forge-subject-option"
                  onClick={() => { setSubjectId(s.id); setShowPicker(false) }}
                >
                  <span className="forge-option-name">{s.name}</span>
                  <span className="forge-option-domain text-dim">{s.domain} · Π{s.pi}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="forge-stage-preview">
          {STAGES.map((s, i) => (
            <div key={s.id} className="forge-stage-preview-item text-dim">
              <span className="font-mono">{s.glyph}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Active stage ──────────────────────────────────────────────────────────
  const stage = STAGES[stageIdx]

  return (
    <div className="forge-view">
      {/* Stage header */}
      <div className="forge-stage-header">
        <div className="forge-stage-dots">
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              className={`forge-dot ${i < stageIdx ? 'forge-dot--done' : i === stageIdx ? 'forge-dot--active' : ''}`}
              style={i === stageIdx ? { background: phaseColour } : i < stageIdx ? { background: phaseColour, opacity: 0.4 } : {}}
              title={s.label}
            />
          ))}
        </div>
        <div className="forge-stage-label font-mono" style={{ color: phaseColour }}>
          {stage.glyph} Stage {stageIdx + 1} — {stage.label}
        </div>
        <div className="forge-subject-badge text-dim">{subject.name}</div>
      </div>

      {/* Stage content */}
      <div className="forge-stage-body">
        {stage.id === 'read' && (
          <ReadStage subject={subject} content={sectionContent} phaseColour={phaseColour} onAdvance={advance} />
        )}
        {stage.id === 'reflect' && (
          <ReflectStage subject={subject} phaseColour={phaseColour} onAdvance={advance} />
        )}
        {stage.id === 'practice' && (
          <PracticeStage subject={subject} phase={phase} phaseColour={phaseColour} onAdvance={advance} />
        )}
        {stage.id === 'council' && (
          <CouncilStage subject={subject} phaseColour={phaseColour} apiKeys={apiKeys} onAdvance={advance} />
        )}
        {stage.id === 'journal' && (
          <JournalStage subject={subject} phaseColour={phaseColour} onAdvance={advance} />
        )}
        {stage.id === 'master' && (
          <MasterStage subject={subject} phaseColour={phaseColour} onAdvance={advance} />
        )}
      </div>
    </div>
  )
}

// ─── Stage 1: Read ────────────────────────────────────────────────────────────

function ReadStage({ subject, content, phaseColour, onAdvance }) {
  const html = useMemo(() => content ? marked.parse(content) : '', [content])
  const scrollRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) setScrolled(true)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="forge-read">
      <div className="forge-read-scroll" ref={scrollRef}>
        {html ? (
          <div className="markdown-body forge-article" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="forge-no-article">
            <p className="text-dim">No article found for <strong>{subject.name}</strong>.</p>
            <p className="text-dim">{subject.notes || 'Use the Guide to explore this subject.'}</p>
            {subject.experiment && (
              <div className="forge-experiment-fallback">
                <div className="text-dim font-mono">Experiment</div>
                <p>{subject.experiment}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="forge-stage-footer">
        {!scrolled && html && (
          <span className="forge-scroll-hint text-dim">Scroll to read the full article</span>
        )}
        <button
          className="btn-primary forge-advance-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={() => onAdvance({ read: true })}
          disabled={!scrolled && !!html}
        >
          I've read this → Reflect
        </button>
      </div>
    </div>
  )
}

// ─── Stage 2: Reflect ─────────────────────────────────────────────────────────

function ReflectStage({ subject, phaseColour, onAdvance }) {
  const questions = useMemo(() => FORGE_REFLECT_QUESTIONS.map(fn => fn(subject.name)), [subject.name])
  const [answers, setAnswers] = useState(['', '', ''])

  const allAnswered = answers.every(a => a.trim().length >= 15)

  return (
    <div className="forge-reflect">
      <p className="forge-reflect-intro text-dim">
        Three questions. Answer in your own words — not what you think the right answer is, but what is actually true for you right now.
      </p>
      {questions.map((q, i) => (
        <div key={i} className="forge-reflect-q">
          <div className="forge-reflect-q-label font-mono text-dim" style={{ color: phaseColour }}>
            {i + 1}.
          </div>
          <div className="forge-reflect-q-text">{q}</div>
          <textarea
            className="forge-reflect-answer"
            placeholder="Your answer…"
            value={answers[i]}
            onChange={e => setAnswers(a => { const n = [...a]; n[i] = e.target.value; return n })}
            rows={3}
          />
          {answers[i].trim().length > 0 && answers[i].trim().length < 15 && (
            <span className="forge-answer-hint text-dim">Keep going…</span>
          )}
        </div>
      ))}
      <div className="forge-stage-footer">
        <button
          className="btn-primary forge-advance-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          disabled={!allAnswered}
          onClick={() => onAdvance({ questions, answers })}
        >
          Answers recorded → Practice
        </button>
      </div>
    </div>
  )
}

// ─── Stage 3: Practice ────────────────────────────────────────────────────────

function PracticeStage({ subject, phase, phaseColour, onAdvance }) {
  const prac = DOMAIN_PRACTICE[subject.domain] || DEFAULT_PRACTICE
  const DURATION = 5 * 60 // 5 minutes in seconds
  const [started, setStarted] = useState(false)
  const [remaining, setRemaining] = useState(DURATION)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!started || done) return
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(timerRef.current); setDone(true); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  const mins = Math.floor(remaining / 60)
  const secs = String(remaining % 60).padStart(2, '0')
  const pct = ((DURATION - remaining) / DURATION) * 100

  return (
    <div className="forge-practice">
      <div className="forge-practice-type font-mono text-dim" style={{ color: phaseColour }}>
        {prac.type.charAt(0).toUpperCase() + prac.type.slice(1)} · 5 minutes
      </div>
      <div className="forge-practice-prompt">{prac.prompt}</div>

      {!started ? (
        <button
          className="btn-primary forge-advance-btn forge-practice-start"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={() => setStarted(true)}
        >
          Begin practice
        </button>
      ) : (
        <div className="forge-timer">
          <svg className="forge-timer-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={phaseColour}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="forge-timer-display font-mono" style={{ color: phaseColour }}>
            {done ? '✓' : `${mins}:${secs}`}
          </div>
        </div>
      )}

      {started && (
        <div className="forge-stage-footer">
          <button
            className="btn-primary forge-advance-btn"
            style={{ background: phaseColour, borderColor: phaseColour }}
            onClick={() => onAdvance({ type: prac.type, duration: DURATION - remaining })}
          >
            {done ? 'Practice complete → Council' : 'Skip to Council'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Stage 4: Council ─────────────────────────────────────────────────────────

function CouncilStage({ subject, phaseColour, apiKeys, onAdvance }) {
  const providerList = Object.values(PROVIDERS)
  const [thesis, setThesis] = useState('')
  const [teachers, setTeachers] = useState(['deepseek', 'claude'])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function toggleTeacher(id) {
    setTeachers(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(p => p !== id) : prev) : prev.length < 2 ? [...prev, id] : prev
    )
  }

  async function submit() {
    if (thesis.trim().length < 20) return
    setLoading(true)
    setErrors({})
    const systemPrompt = `You are a teacher in The Mystery School Council. The subject is: ${subject.name} (${subject.domain}).
A student has written a thesis about this subject. Respond in 200-300 words: engage with their specific claim, affirm what is sound, challenge what is untested, and close with one question that would take their thinking deeper. Sign off with your name.`

    await Promise.all(teachers.map(async pid => {
      const key = apiKeys[pid]
      if (!key) { setErrors(e => ({ ...e, [pid]: `No API key for ${PROVIDERS[pid].name}.` })); return }
      try {
        const reply = await callProvider(pid, {
          systemPrompt,
          messages: [{ role: 'user', content: `My thesis: ${thesis.trim()}` }],
          maxTokens: 500,
          temperature: 0.8,
          apiKey: key,
        })
        setResponses(r => ({ ...r, [pid]: reply }))
      } catch (err) {
        setErrors(e => ({ ...e, [pid]: err.message }))
      }
    }))
    setLoading(false)
    setSubmitted(true)
  }

  const canAdvance = submitted && Object.keys(responses).length > 0

  return (
    <div className="forge-council">
      <p className="forge-council-intro text-dim">
        Write a thesis — one claim about <strong>{subject.name}</strong>. Two teachers will respond. They will push back.
      </p>

      <div className="forge-teacher-row">
        {providerList.map(p => {
          const active = teachers.includes(p.id)
          const hasKey = !!apiKeys[p.id]
          return (
            <button
              key={p.id}
              className={`forge-teacher-chip ${active ? 'forge-teacher-chip--active' : ''} ${!hasKey ? 'forge-teacher-chip--nokey' : ''}`}
              style={active ? { borderColor: p.colour, color: p.colour } : {}}
              onClick={() => !submitted && toggleTeacher(p.id)}
              disabled={submitted}
              title={!hasKey ? 'No API key — add in Settings' : ''}
            >
              <span className="font-mono">{p.glyph}</span> {p.name}
            </button>
          )
        })}
      </div>

      <textarea
        className="forge-thesis-input"
        placeholder={`My thesis about ${subject.name}…`}
        value={thesis}
        onChange={e => setThesis(e.target.value)}
        disabled={submitted}
        rows={4}
      />

      {!submitted && (
        <button
          className="btn-primary forge-submit-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          disabled={thesis.trim().length < 20 || loading}
          onClick={submit}
        >
          {loading ? 'Teachers responding…' : 'Submit to Council'}
        </button>
      )}

      {Object.entries(responses).map(([pid, text]) => {
        const p = PROVIDERS[pid]
        return (
          <div key={pid} className="forge-council-response">
            <div className="forge-council-response-header font-mono" style={{ color: p.colour }}>
              {p.glyph} {p.name}
            </div>
            <div className="forge-council-response-body">{text}</div>
          </div>
        )
      })}

      {Object.entries(errors).map(([pid, msg]) => (
        <div key={pid} className="forge-error text-dim">{PROVIDERS[pid]?.name}: {msg}</div>
      ))}

      <div className="forge-stage-footer">
        <button
          className="btn-primary forge-advance-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={() => onAdvance({ thesis, responses: Object.entries(responses).map(([id, content]) => ({ providerId: id, content })) })}
          disabled={loading}
        >
          {canAdvance ? 'Council done → Journal' : 'Skip to Journal'}
        </button>
      </div>
    </div>
  )
}

// ─── Stage 5: Journal ─────────────────────────────────────────────────────────

function JournalStage({ subject, phaseColour, onAdvance }) {
  const prompt = `The Forge — ${subject.name}. What shifted? What surprised you? What do you carry forward from this session?`
  const [text, setText] = useState('')

  return (
    <div className="forge-journal">
      <div className="forge-journal-prompt text-dim font-serif">{prompt}</div>
      <textarea
        className="forge-journal-input"
        placeholder="Write what arose…"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={8}
        autoFocus
      />
      <div className="forge-journal-hint text-dim">
        {text.trim().length > 0 ? `${text.trim().length} characters` : 'Write freely — this is private'}
      </div>
      <div className="forge-stage-footer">
        <button
          className="btn-primary forge-advance-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={() => onAdvance({ prompt, text })}
        >
          {text.trim().length >= 20 ? 'Journal saved → Master' : 'Skip to Master'}
        </button>
      </div>
    </div>
  )
}

// ─── Stage 6: Master ─────────────────────────────────────────────────────────

function MasterStage({ subject, phaseColour, onAdvance }) {
  const [currentMastery, setCurrentMastery] = useState(0)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.MASTERY_STAGES),
      getStoreValue(KEYS.PROGRESS),
    ]).then(([stages, progress]) => {
      const slugId = subject.id
      const fromStages = stages?.[slugId] ?? 0
      const fromProgress = progress?.[slugId]?.mastery ?? 0
      setCurrentMastery(Math.max(fromStages, fromProgress))
    })
  }, [subject.id])

  const nextLevel = Math.min(currentMastery + 1, 4)
  const nextInfo = MASTERY_LEVELS[nextLevel]
  const currentInfo = MASTERY_LEVELS[currentMastery]

  async function advance() {
    // Update mastery stage
    const stages = await getStoreValue(KEYS.MASTERY_STAGES) || {}
    stages[subject.id] = nextLevel
    await setStoreValue(KEYS.MASTERY_STAGES, stages)

    // Update progress record
    const progress = await getStoreValue(KEYS.PROGRESS) || {}
    progress[subject.id] = {
      ...(progress[subject.id] || {}),
      mastery: nextLevel,
      masteryNote: note,
      status: nextLevel >= 4 ? 'completed' : (progress[subject.id]?.status || 'started'),
    }
    await setStoreValue(KEYS.PROGRESS, progress)

    setSaved(true)
    setTimeout(() => onAdvance({ from: currentMastery, to: nextLevel, note }), 600)
  }

  return (
    <div className="forge-master">
      <div className="forge-master-current">
        <div className="forge-master-label text-dim">Current mastery</div>
        <div className="forge-master-level font-mono" style={{ color: currentInfo.colour }}>
          {currentInfo.glyph} {currentInfo.label}
        </div>
      </div>

      <div className="forge-master-arrow font-mono text-dim">↓</div>

      <div className="forge-master-next" style={{ borderColor: nextInfo.colour }}>
        <div className="forge-master-label text-dim">Advance to</div>
        <div className="forge-master-level font-mono" style={{ color: nextInfo.colour }}>
          {nextInfo.glyph} {nextInfo.label}
        </div>
      </div>

      <div className="forge-master-note-label text-dim">
        Evidence note — what in you has changed? (optional)
      </div>
      <textarea
        className="forge-master-note"
        placeholder="What has shifted that earns this level…"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        disabled={saved}
      />

      <div className="forge-stage-footer">
        <button
          className="btn-primary forge-advance-btn forge-complete-btn"
          style={{ background: saved ? '#6BAA80' : phaseColour, borderColor: saved ? '#6BAA80' : phaseColour }}
          onClick={advance}
          disabled={saved}
        >
          {saved ? '✓ Mastery advanced' : `Advance to ${nextInfo.label} → Complete the Forge`}
        </button>
        {currentMastery >= 4 && (
          <button className="forge-skip-btn text-dim" onClick={() => onAdvance({ from: currentMastery, to: currentMastery, note })}>
            Already at Integrated — complete
          </button>
        )}
      </div>
    </div>
  )
}
