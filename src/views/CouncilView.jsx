import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { callProvider, PROVIDERS } from '../../engine/api'
import { SUBJECTS } from '../../data/subjects'
import { PHASE_COLOURS } from '../../theme/colours'
import { KEYS } from '../../data/schema'
import './CouncilView.css'

const PHASE_NAMES = ['', 'Stillness', 'Flow', 'Insight', 'Rising', 'Synthesis', 'Witnessing', 'Return']

function subjectMeta(subject) {
  return `Subject metadata:
- Π score (truth pressure): ${subject.pi}
- Layer: ${subject.layer}
- Experiment: ${subject.experiment || 'See subject notes'}
- Notes: ${subject.notes || ''}
${subject.contraindications ? `- Contraindications: ${subject.contraindications}` : ''}`
}

// Standard teaching prompt
function buildTeacherPrompt(provider, subject, userPhase) {
  const phaseName = PHASE_NAMES[userPhase] || 'Stillness'
  return `You are ${provider.name}, an AI brought into The Mystery School's Teacher Council.

The subject is: **${subject.name}** (Domain: ${subject.domain})
The student is currently in Phase ${userPhase} — ${phaseName}.

Your role: Teach this subject with the depth and precision unique to your training. You are a specific intelligence with your own emphases, frameworks, and perspectives. Do not pretend to agree with other teachers if you have a different view.

**Guidelines:**
- Teach directly. No preamble about being an AI.
- Draw on what you know uniquely. Bring your own angle.
- Keep responses focused — 200-350 words unless the question demands more.
- If you disagree with how a subject is framed, say so with reasoning.
- End each response with: your name and one sentence on what you uniquely bring to this subject.

${subjectMeta(subject)}`
}

// Debate Mode prompt — adversarial, positions held under pressure
function buildDebatePrompt(provider, subject, userPhase) {
  const phaseName = PHASE_NAMES[userPhase] || 'Stillness'
  return `You are ${provider.name}, participating in a structured intellectual debate at The Mystery School.

The subject under debate: **${subject.name}** (Domain: ${subject.domain})
The student observer is in Phase ${userPhase} — ${phaseName}.

**Your role in Debate Mode:**
- Take a clear, defensible position on the most contested aspect of this subject.
- Challenge other teachers' arguments when you see weaknesses in their reasoning.
- Do not soften disagreements. Intellectual pressure is the point.
- When given another teacher's argument, engage with their specific claims — not a strawman.
- Keep rebuttals to 150-250 words. Be sharp, not verbose.
- Signal your position at the start: "I hold that..." or "My position:"
- At the end: your name + the core disagreement you're pressing.

${subjectMeta(subject)}`
}

// Socratic Mode prompt — questions only, no answers
function buildSocraticPrompt(provider, subject, userPhase) {
  const phaseName = PHASE_NAMES[userPhase] || 'Stillness'
  return `You are ${provider.name}, operating in Socratic Mode at The Mystery School.

The subject: **${subject.name}** (Domain: ${subject.domain})
The student is in Phase ${userPhase} — ${phaseName}.

**Socratic Mode rules — NON-NEGOTIABLE:**
- You may ONLY ask questions. Never give answers, explanations, or conclusions.
- Each response: 1-3 questions maximum. Never more.
- Questions should reveal hidden assumptions, surface contradictions, or open new inquiry.
- If the student provides an answer, question the assumptions behind that answer.
- The student must do the thinking. You are the midwife, not the lecturer.
- End with your name only — no commentary.

If the student asks "why aren't you just telling me?" — respond with a question about why they expect to be told.

${subjectMeta(subject)}`
}

const PROVIDER_LIST = Object.values(PROVIDERS)

export default function CouncilView({ navPayload }) {
  const { state } = useStore()
  const phase = state?.coordinates?.phase || 1
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#C8A96E'

  // Selected teachers (up to 4)
  const [activeProviders, setActiveProviders] = useState(['deepseek'])
  // Selected subject
  const [subjectId, setSubjectId] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showSubjectPicker, setShowSubjectPicker] = useState(false)
  // Mode
  const [mode, setMode] = useState('standard') // 'standard' | 'debate' | 'socratic'
  // Session state
  const [sessions, setSessions] = useState({}) // providerId → messages[]
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState({}) // providerId → bool
  const [errors, setErrors] = useState({})
  const [apiKeys, setApiKeys] = useState({})
  const [started, setStarted] = useState(false)
  const [savedSessions, setSavedSessions] = useState([])
  const [viewingSession, setViewingSession] = useState(null) // saved session to view
  const [sessionSaved, setSessionSaved] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    // Load all API keys + saved sessions
    Promise.all([
      ...PROVIDER_LIST.map(p => getStoreValue(p.settingsKey).then(k => [p.id, k || ''])),
      getStoreValue(KEYS.COUNCIL_SESSIONS),
    ]).then(results => {
      const saved = results.pop()
      setSavedSessions(saved || [])
      setApiKeys(Object.fromEntries(results))
    })
  }, [])

  useEffect(() => {
    if (!navPayload?.prefill) return
    setSubjectSearch(navPayload.prefill)
    setShowSubjectPicker(true)
  }, [navPayload])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessions, loading])

  const subject = useMemo(() => SUBJECTS.find(s => s.id === subjectId) || null, [subjectId])

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return SUBJECTS.slice(0, 30)
    const q = subjectSearch.toLowerCase()
    return SUBJECTS.filter(s =>
      s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
    ).slice(0, 30)
  }, [subjectSearch])

  function toggleProvider(id) {
    setActiveProviders(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(p => p !== id) : prev
        : prev.length < 4 ? [...prev, id] : prev
    )
  }

  function getSystemPrompt(provider) {
    if (mode === 'debate')   return buildDebatePrompt(provider, subject, phase)
    if (mode === 'socratic') return buildSocraticPrompt(provider, subject, phase)
    return buildTeacherPrompt(provider, subject, phase)
  }

  function getOpeningMsg() {
    if (mode === 'debate') {
      return `State your position on the most contested or misunderstood aspect of **${subject.name}**. Be clear, direct, and ready to defend it.`
    }
    if (mode === 'socratic') {
      return `A student in Phase ${phase} wants to understand **${subject.name}**. Begin the inquiry — ask the opening question.`
    }
    return `Introduce this subject to a student in Phase ${phase}. What is ${subject.name}, why does it matter, and what would you have them understand first?`
  }

  async function openSession() {
    if (!subject) return
    setStarted(true)
    setErrors({})

    const openingMsg = getOpeningMsg()
    const initSessions = {}
    activeProviders.forEach(pid => {
      initSessions[pid] = [{ role: 'user', content: openingMsg, id: Date.now() }]
    })
    setSessions(initSessions)

    const loadingState = {}
    activeProviders.forEach(pid => { loadingState[pid] = true })
    setLoading(loadingState)

    await Promise.all(activeProviders.map(async pid => {
      const provider = PROVIDERS[pid]
      const key = apiKeys[pid]
      if (!key) {
        setErrors(e => ({ ...e, [pid]: `No API key for ${provider.name}. Add in Settings.` }))
        setLoading(l => ({ ...l, [pid]: false }))
        return
      }
      try {
        const systemPrompt = getSystemPrompt(provider)
        const reply = await callProvider(pid, {
          systemPrompt,
          messages: [{ role: 'user', content: openingMsg }],
          maxTokens: 600,
          temperature: 0.85,
          apiKey: key,
        })
        setSessions(prev => ({
          ...prev,
          [pid]: [
            ...(prev[pid] || []),
            { role: 'assistant', content: reply, id: Date.now() + Math.random() },
          ],
        }))
      } catch (err) {
        setErrors(e => ({ ...e, [pid]: err.message }))
      } finally {
        setLoading(l => ({ ...l, [pid]: false }))
      }
    }))
  }

  // Debate Mode: each teacher reads others' last response and rebuts
  async function crossExamine() {
    if (activeProviders.length < 2) return
    setErrors({})

    // Compile each teacher's most recent assistant message
    const lastResponses = {}
    activeProviders.forEach(pid => {
      const msgs = sessions[pid] || []
      const last = [...msgs].reverse().find(m => m.role === 'assistant')
      if (last) lastResponses[pid] = last.content
    })

    if (Object.keys(lastResponses).length < 2) return

    const loadingState = {}
    activeProviders.forEach(pid => { loadingState[pid] = true })
    setLoading(loadingState)

    await Promise.all(activeProviders.map(async pid => {
      const provider = PROVIDERS[pid]
      const key = apiKeys[pid]
      if (!key) { setLoading(l => ({ ...l, [pid]: false })); return }

      // Build cross-examination prompt: show this teacher what the others said
      const otherTeachers = activeProviders
        .filter(p => p !== pid && lastResponses[p])
        .map(p => `**${PROVIDERS[p].name} argued:** ${lastResponses[p]}`)
        .join('\n\n')

      const crossMsg = `The other teachers have stated their positions:\n\n${otherTeachers}\n\nRespond. Challenge their weakest points. Defend your own position.`

      const userMsg = { role: 'user', content: crossMsg, id: Date.now() }
      setSessions(prev => ({ ...prev, [pid]: [...(prev[pid] || []), userMsg] }))

      try {
        const systemPrompt = getSystemPrompt(provider)
        const currentMsgs = [...(sessions[pid] || []), userMsg]
        const reply = await callProvider(pid, {
          systemPrompt,
          messages: currentMsgs.map(m => ({ role: m.role, content: m.content })),
          maxTokens: 500,
          temperature: 0.9,
          apiKey: key,
        })
        setSessions(prev => ({
          ...prev,
          [pid]: [...(prev[pid] || []), { role: 'assistant', content: reply, id: Date.now() + Math.random() }],
        }))
      } catch (err) {
        setErrors(e => ({ ...e, [pid]: err.message }))
      } finally {
        setLoading(l => ({ ...l, [pid]: false }))
      }
    }))
  }

  async function askAll() {
    if (!input.trim() || !subject) return
    const question = input.trim()
    setInput('')
    setErrors({})

    // Add user message to all sessions
    setSessions(prev => {
      const updated = { ...prev }
      activeProviders.forEach(pid => {
        updated[pid] = [...(prev[pid] || []), { role: 'user', content: question, id: Date.now() }]
      })
      return updated
    })

    const loadingState = {}
    activeProviders.forEach(pid => { loadingState[pid] = true })
    setLoading(loadingState)

    await Promise.all(activeProviders.map(async pid => {
      const provider = PROVIDERS[pid]
      const key = apiKeys[pid]
      if (!key) {
        setErrors(e => ({ ...e, [pid]: `No API key for ${provider.name}.` }))
        setLoading(l => ({ ...l, [pid]: false }))
        return
      }
      try {
        const systemPrompt = getSystemPrompt(provider)
        const currentMsgs = [...(sessions[pid] || []), { role: 'user', content: question }]
        const reply = await callProvider(pid, {
          systemPrompt,
          messages: currentMsgs.map(m => ({ role: m.role, content: m.content })),
          maxTokens: 600,
          temperature: 0.85,
          apiKey: key,
        })
        setSessions(prev => ({
          ...prev,
          [pid]: [
            ...(prev[pid] || []),
            { role: 'assistant', content: reply, id: Date.now() + Math.random() },
          ],
        }))
      } catch (err) {
        setErrors(e => ({ ...e, [pid]: err.message }))
      } finally {
        setLoading(l => ({ ...l, [pid]: false }))
      }
    }))
  }

  async function askOne(pid, question) {
    const provider = PROVIDERS[pid]
    const key = apiKeys[pid]
    if (!key || !question.trim()) return

    const msg = { role: 'user', content: question.trim(), id: Date.now() }
    setSessions(prev => ({ ...prev, [pid]: [...(prev[pid] || []), msg] }))
    setLoading(l => ({ ...l, [pid]: true }))
    setErrors(e => ({ ...e, [pid]: '' }))

    try {
      const systemPrompt = getSystemPrompt(provider)
      const msgs = [...(sessions[pid] || []), msg]
      const reply = await callProvider(pid, {
        systemPrompt,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
        maxTokens: 600,
        temperature: 0.85,
        apiKey: key,
      })
      setSessions(prev => ({
        ...prev,
        [pid]: [...(prev[pid] || []), { role: 'assistant', content: reply, id: Date.now() }],
      }))
    } catch (err) {
      setErrors(e => ({ ...e, [pid]: err.message }))
    } finally {
      setLoading(l => ({ ...l, [pid]: false }))
    }
  }

  async function saveCurrentSession() {
    if (!subject || !started) return
    const saved = {
      id: 'cs_' + Date.now(),
      subject: { id: subject.id, name: subject.name, domain: subject.domain },
      teachers: activeProviders.map(pid => ({
        id: pid,
        name: PROVIDERS[pid]?.name,
        glyph: PROVIDERS[pid]?.glyph,
        colour: PROVIDERS[pid]?.colour,
      })),
      mode,
      sessions: { ...sessions },
      savedAt: new Date().toISOString(),
      phase,
    }
    const updated = [saved, ...savedSessions]
    setSavedSessions(updated)
    await setStoreValue(KEYS.COUNCIL_SESSIONS, updated)
    setSessionSaved(true)
    setTimeout(() => setSessionSaved(false), 2000)
  }

  async function deleteSavedSession(id) {
    const updated = savedSessions.filter(s => s.id !== id)
    setSavedSessions(updated)
    await setStoreValue(KEYS.COUNCIL_SESSIONS, updated)
    if (viewingSession?.id === id) setViewingSession(null)
  }

  function exportSessionMd(sess) {
    const lines = []
    lines.push(`# Council Session: ${sess.subject.name}`)
    lines.push(`**Date:** ${new Date(sess.savedAt).toLocaleString()}`)
    lines.push(`**Mode:** ${sess.mode}`)
    lines.push(`**Teachers:** ${sess.teachers.map(t => t.name).join(', ')}`)
    lines.push('')
    sess.teachers.forEach(t => {
      lines.push(`---`)
      lines.push(`## ${t.name}`)
      const msgs = sess.sessions[t.id] || []
      msgs.forEach(m => {
        if (m.role === 'user') {
          lines.push(`**Student:** ${m.content}`)
        } else {
          lines.push(`**${t.name}:** ${m.content}`)
        }
        lines.push('')
      })
    })
    const md = lines.join('\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `council-${sess.subject.name.toLowerCase().replace(/\s+/g, '-')}-${sess.savedAt.slice(0,10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setStarted(false)
    setSessions({})
    setErrors({})
    setSubjectId('')
    setSubjectSearch('')
    setInput('')
    setSessionSaved(false)
  }

  // ── Setup screen ────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="council-setup">
        <div className="council-setup-inner">
          <div className="council-setup-header">
            <span className="council-glyph font-mono" style={{ color: phaseColour }}>⊕</span>
            <h1 className="font-serif council-setup-title">The Council</h1>
            <p className="text-dim council-setup-sub">Multiple AI teachers. One subject. Simultaneous perspectives.</p>
          </div>

          {/* Subject picker */}
          <div className="council-section">
            <div className="council-section-label text-dim">Choose a subject</div>
            {subject ? (
              <div className="council-subject-selected" style={{ borderColor: phaseColour }}>
                <div className="council-subject-selected-name">{subject.name}</div>
                <div className="council-subject-selected-domain text-dim">{subject.domain} · Π{subject.pi}</div>
                <button className="council-subject-change text-dim" onClick={() => { setSubjectId(''); setShowSubjectPicker(true) }}>
                  Change
                </button>
              </div>
            ) : (
              <div className="council-subject-picker">
                <input
                  className="council-search"
                  placeholder="Search subjects…"
                  value={subjectSearch}
                  onChange={e => { setSubjectSearch(e.target.value); setShowSubjectPicker(true) }}
                  onFocus={() => setShowSubjectPicker(true)}
                />
                {showSubjectPicker && (
                  <div className="council-subject-dropdown">
                    {filteredSubjects.map(s => (
                      <button
                        key={s.id}
                        className="council-subject-option"
                        onClick={() => { setSubjectId(s.id); setShowSubjectPicker(false); setSubjectSearch(s.name) }}
                      >
                        <span className="council-subject-option-name">{s.name}</span>
                        <span className="council-subject-option-domain text-dim">{s.domain}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode selector */}
          <div className="council-section">
            <div className="council-section-label text-dim">Session mode</div>
            <div className="council-mode-grid">
              {[
                { id: 'standard', glyph: '⊕', label: 'Standard', desc: 'Each teacher answers independently' },
                { id: 'debate',   glyph: '⚔', label: 'Debate',   desc: 'Teachers hold positions and challenge each other' },
                { id: 'socratic', glyph: '?', label: 'Socratic', desc: 'Teachers only ask questions — you do the thinking' },
              ].map(m => (
                <button
                  key={m.id}
                  className={`council-mode-card ${mode === m.id ? 'council-mode-card--active' : ''}`}
                  style={mode === m.id ? { borderColor: phaseColour } : {}}
                  onClick={() => setMode(m.id)}
                >
                  <span className="council-mode-glyph font-mono" style={mode === m.id ? { color: phaseColour } : {}}>{m.glyph}</span>
                  <div>
                    <div className="council-mode-label" style={mode === m.id ? { color: phaseColour } : {}}>{m.label}</div>
                    <div className="council-mode-desc text-dim">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Teacher selection */}
          <TeacherPicker
            providers={PROVIDER_LIST}
            active={activeProviders}
            apiKeys={apiKeys}
            phaseColour={phaseColour}
            onToggle={toggleProvider}
          />

          <button
            className="btn-primary council-start-btn"
            style={{ background: phaseColour, borderColor: phaseColour }}
            disabled={!subject || activeProviders.length === 0}
            onClick={openSession}
          >
            Open the Council
          </button>

          {/* Past Sessions */}
          {savedSessions.length > 0 && (
            <div className="council-section">
              <div className="council-section-label text-dim">Past Sessions</div>
              <div className="council-saved-list">
                {savedSessions.map(sess => (
                  <div key={sess.id} className="council-saved-item">
                    <button
                      className="council-saved-btn"
                      onClick={() => setViewingSession(viewingSession?.id === sess.id ? null : sess)}
                    >
                      <div className="council-saved-subject">{sess.subject.name}</div>
                      <div className="council-saved-meta text-dim font-mono">
                        {sess.teachers.map(t => t.glyph).join(' ')} · {sess.mode} ·{' '}
                        {new Date(sess.savedAt).toLocaleDateString()}
                      </div>
                    </button>
                    <div className="council-saved-actions">
                      <button
                        className="council-saved-action text-dim"
                        onClick={() => exportSessionMd(sess)}
                        title="Export as Markdown"
                      >↓ md</button>
                      <button
                        className="council-saved-action council-saved-delete"
                        onClick={() => deleteSavedSession(sess.id)}
                        title="Delete"
                      >×</button>
                    </div>

                    {viewingSession?.id === sess.id && (
                      <div className="council-saved-view">
                        {sess.teachers.map(t => {
                          const msgs = sess.sessions[t.id] || []
                          const assistantMsgs = msgs.filter(m => m.role === 'assistant')
                          return (
                            <div key={t.id} className="council-saved-teacher">
                              <div className="council-saved-teacher-name font-mono" style={{ color: t.colour }}>
                                {t.glyph} {t.name}
                              </div>
                              {assistantMsgs.map((msg, i) => (
                                <p key={i} className="council-saved-msg text-dim">
                                  {msg.content.slice(0, 300)}{msg.content.length > 300 ? '…' : ''}
                                </p>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Council session ─────────────────────────────────────────────────
  const columnCount = activeProviders.length
  const isLoading = Object.values(loading).some(Boolean)

  return (
    <div className="council-session">
      {/* Session header */}
      <div className="council-session-header">
        <div className="council-session-left">
          <span className="font-mono" style={{ color: phaseColour }}>⊕</span>
          <span className="council-session-subject font-serif">{subject?.name}</span>
          <span className="text-dim council-session-domain">{subject?.domain}</span>
          <span className="council-mode-badge text-dim font-mono">{mode}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {mode === 'debate' && activeProviders.length >= 2 && (
            <button
              className="council-crossexamine-btn"
              style={{ borderColor: phaseColour, color: phaseColour }}
              onClick={crossExamine}
              disabled={isLoading}
            >
              ⚔ Cross-Examine
            </button>
          )}
          <button
            className={`council-save-btn ${sessionSaved ? 'council-save-btn--saved' : ''}`}
            onClick={saveCurrentSession}
            title="Save this session"
          >
            {sessionSaved ? '✓ Saved' : '↓ Save'}
          </button>
          <button className="council-reset-btn text-dim" onClick={reset}>← New Session</button>
        </div>
      </div>

      {/* Teacher columns */}
      <div className="council-columns" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {activeProviders.map(pid => {
          const provider = PROVIDERS[pid]
          const msgs = sessions[pid] || []
          const isLoad = loading[pid]
          const err = errors[pid]

          return (
            <div key={pid} className="council-column">
              {/* Column header */}
              <div className="council-col-header" style={{ borderBottomColor: provider.colour }}>
                <span className="council-col-glyph font-mono" style={{ color: provider.colour }}>{provider.glyph}</span>
                <span className="council-col-name" style={{ color: provider.colour }}>{provider.name}</span>
              </div>

              {/* Messages */}
              <div className="council-col-messages">
                {msgs.filter(m => m.role === 'assistant').map(msg => (
                  <div key={msg.id} className="council-teacher-msg">
                    <div className="council-teacher-msg-content">
                      {msg.content.split('\n').map((line, i) =>
                        line ? <p key={i}>{line}</p> : <br key={i} />
                      )}
                    </div>
                  </div>
                ))}
                {isLoad && (
                  <div className="council-teacher-loading">
                    <span style={{ color: provider.colour }} className="font-mono">{provider.glyph}</span>
                    <div className="guide-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                {err && <div className="council-col-error">{err}</div>}
              </div>

              {/* Direct question input */}
              <DirectInput
                provider={provider}
                onSend={(q) => askOne(pid, q)}
                disabled={isLoad}
              />
            </div>
          )
        })}
      </div>

      {/* Broadcast input — asks all teachers */}
      <div className="council-broadcast">
        <textarea
          className="council-input"
          placeholder={mode === 'socratic' ? 'Share your thinking… (Enter to send)' : mode === 'debate' ? 'Challenge them further… (Enter to send)' : 'Ask all teachers… (Enter to send)'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAll() } }}
          disabled={isLoading}
          rows={1}
        />
        <button
          className="council-send-btn"
          style={{ background: phaseColour, borderColor: phaseColour }}
          onClick={askAll}
          disabled={!input.trim() || isLoading}
        >
          {mode === 'socratic' ? 'Respond ↑' : 'Ask All ↑'}
        </button>
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

function DirectInput({ provider, onSend, disabled }) {
  const [val, setVal] = useState('')
  function send() {
    if (!val.trim()) return
    onSend(val)
    setVal('')
  }
  return (
    <div className="council-direct-input">
      <input
        className="council-direct-field"
        placeholder={`Ask ${provider.name} only…`}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') send() }}
        disabled={disabled}
      />
      <button
        className="council-direct-send font-mono"
        style={{ color: provider.colour }}
        onClick={send}
        disabled={!val.trim() || disabled}
      >↑</button>
    </div>
  )
}

function TeacherPicker({ providers, active, apiKeys, phaseColour, onToggle }) {
  const [expandedBio, setExpandedBio] = useState(null)
  return (
    <div className="council-section">
      <div className="council-section-label text-dim">Select teachers (1–4)</div>
      <div className="council-teacher-list">
        {providers.map(p => {
          const isActive = active.includes(p.id)
          const hasKey = !!apiKeys[p.id]
          const bioOpen = expandedBio === p.id
          return (
            <div
              key={p.id}
              className={`council-teacher-row ${isActive ? 'council-teacher-row--active' : ''} ${!hasKey ? 'council-teacher-row--nokey' : ''}`}
              style={isActive ? { borderColor: p.colour } : {}}
            >
              <button
                className="council-teacher-main"
                onClick={() => onToggle(p.id)}
              >
                <span className="council-provider-glyph font-mono" style={{ color: p.colour }}>{p.glyph}</span>
                <div className="council-teacher-info">
                  <span className="council-provider-name">{p.name}</span>
                  {!hasKey && <span className="council-provider-badge text-dim">No key</span>}
                  {hasKey && isActive && <span className="council-provider-badge" style={{ color: p.colour }}>✓</span>}
                </div>
              </button>
              {p.bio && (
                <button
                  className="council-teacher-bio-btn text-dim"
                  onClick={e => { e.stopPropagation(); setExpandedBio(bioOpen ? null : p.id) }}
                  title="View teacher profile"
                >
                  {bioOpen ? '▲' : '▼'}
                </button>
              )}
              {bioOpen && p.bio && (
                <div className="council-teacher-bio text-dim">
                  {p.bio}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="council-key-hint text-dim">Add API keys in Settings → API Keys</p>
    </div>
  )
}
