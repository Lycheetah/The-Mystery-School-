import React, { useState, useEffect } from 'react'
import { useStore, getStoreValue, setStoreValue } from '../hooks/useStore'
import { callProvider, PROVIDERS } from '../../engine/api'
import { drawCasting, buildOraclePrompt, makeCastingRecord, canCastToday } from '../../engine/oracle'
import { KEYS } from '../../data/schema'
import './OracleView.css'

export default function OracleView({ onClose }) {
  const { state } = useStore()
  const phase   = state?.coordinates?.phase || state?.phase || 1
  const door    = state?.door || 'SEEKER'

  const [question, setQuestion]   = useState('')
  const [casting, setCasting]     = useState(null)
  const [reading, setReading]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [phase_, setPhase_]       = useState('ask')  // ask | casting | reading | history
  const [history, setHistory]     = useState([])
  const [canCast, setCanCast]     = useState(true)
  const [lastDate, setLastDate]   = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    Promise.all([
      getStoreValue(KEYS.ORACLE_CASTINGS),
      getStoreValue(KEYS.ORACLE_LAST_DATE),
      getStoreValue(KEYS.PROGRESS),
    ]).then(([castings, lastD, progress]) => {
      setHistory(castings || [])
      setLastDate(lastD || null)
      setCanCast(canCastToday(lastD))
    })
  }, [])

  async function handleCast() {
    if (!question.trim()) return
    setError('')
    setLoading(true)
    setPhase_('casting')

    const progress = await getStoreValue(KEYS.PROGRESS) || {}
    const cast = drawCasting(phase, door, progress)
    setCasting(cast)

    // Find active API key
    let apiKey = null
    let providerId = 'deepseek'
    for (const p of Object.values(PROVIDERS)) {
      const k = await getStoreValue(p.settingsKey)
      if (k) { apiKey = k; providerId = p.id; break }
    }

    if (!apiKey) {
      setError('No API key configured. Add one in Settings to consult the Oracle.')
      setLoading(false)
      setPhase_('ask')
      return
    }

    const oraclePrompt = buildOraclePrompt(question, cast, phase, door)

    try {
      const result = await callProvider(providerId, {
        systemPrompt: oraclePrompt,
        messages: [{ role: 'user', content: 'Speak.' }],
        maxTokens: 600,
        temperature: 0.85,
        apiKey,
      })

      setReading(result)
      setPhase_('reading')

      const record = makeCastingRecord(question, cast, result)
      const existing = await getStoreValue(KEYS.ORACLE_CASTINGS) || []
      const updated = [record, ...existing].slice(0, 50)
      const today = new Date().toISOString().slice(0, 10)
      await setStoreValue(KEYS.ORACLE_CASTINGS, updated)
      await setStoreValue(KEYS.ORACLE_LAST_DATE, today)
      setHistory(updated)
      setCanCast(false)
    } catch (e) {
      setError('The Oracle fell silent. ' + (e?.message || 'Check your API key.'))
      setPhase_('ask')
    }
    setLoading(false)
  }

  return (
    <div className="oracle-overlay">
      <div className="oracle-panel">

        <div className="oracle-header">
          <span className="oracle-glyph font-mono">⟟</span>
          <h2 className="oracle-title font-serif">The Oracle</h2>
          <div className="oracle-header-actions">
            <button className="oracle-icon-btn text-dim" onClick={() => setShowHistory(s => !s)} title="Past castings">
              ◌
            </button>
            <button className="oracle-icon-btn text-dim" onClick={onClose}>✕</button>
          </div>
        </div>

        {showHistory ? (
          <HistoryPanel history={history} onClose={() => setShowHistory(false)} />
        ) : (
          <>
            {phase_ === 'ask' && (
              <AskPanel
                question={question}
                setQuestion={setQuestion}
                onCast={handleCast}
                canCast={canCast}
                lastDate={lastDate}
                error={error}
                loading={loading}
              />
            )}

            {phase_ === 'casting' && (
              <div className="oracle-casting-anim">
                <div className="oracle-casting-glyph">⊗</div>
                <p className="text-dim oracle-casting-label">The Oracle draws…</p>
              </div>
            )}

            {phase_ === 'reading' && casting && (
              <ReadingPanel
                question={question}
                casting={casting}
                reading={reading}
                onNewQuestion={() => { setPhase_('ask'); setQuestion(''); setCasting(null); setReading('') }}
                canCast={canCast}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AskPanel({ question, setQuestion, onCast, canCast, lastDate, error, loading }) {
  return (
    <div className="oracle-ask">
      <p className="oracle-ask-intro text-dim font-serif">
        Ask with precision. The Oracle does not respond to tests or vague gestures.
        One question. One casting. One day.
      </p>

      {!canCast && lastDate && (
        <div className="oracle-used-notice text-dim">
          <span className="font-mono">◎</span> You have consulted the Oracle today.
          Return tomorrow.
        </div>
      )}

      <textarea
        className="oracle-question-input"
        placeholder="What do you ask?"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        rows={3}
        disabled={!canCast || loading}
        maxLength={280}
      />

      {error && <p className="oracle-error text-dim">{error}</p>}

      <button
        className="oracle-cast-btn"
        onClick={onCast}
        disabled={!canCast || !question.trim() || loading}
      >
        {loading ? 'Casting…' : 'Cast the Oracle'}
      </button>
    </div>
  )
}

function ReadingPanel({ question, casting, reading, onNewQuestion, canCast }) {
  const { subject, card, prompt } = casting

  return (
    <div className="oracle-reading">
      <div className="oracle-question-echo text-dim font-serif">"{question}"</div>

      <div className="oracle-draws">
        <div className="oracle-draw-chip">
          <span className="text-dim oracle-draw-label">Subject</span>
          <span className="oracle-draw-value">{subject.name}</span>
        </div>
        <span className="oracle-draw-sep text-dim">×</span>
        <div className="oracle-draw-chip">
          <span className="text-dim oracle-draw-label">Card</span>
          <span className="oracle-draw-value">{card.name}</span>
        </div>
      </div>

      <div className="oracle-text font-serif">{reading}</div>

      <div className="oracle-prompt-card">
        <span className="text-dim oracle-draw-label">The Oracle leaves you with:</span>
        <p className="oracle-prompt-text font-serif">"{prompt}"</p>
      </div>

      {!canCast && (
        <p className="oracle-return-note text-dim">
          The Oracle has spoken. You may return tomorrow.
        </p>
      )}
    </div>
  )
}

function HistoryPanel({ history, onClose }) {
  if (history.length === 0) {
    return (
      <div className="oracle-history-empty text-dim">
        <p>No castings yet. The Oracle awaits your question.</p>
      </div>
    )
  }

  return (
    <div className="oracle-history">
      <div className="oracle-history-head text-dim">Past Castings</div>
      {history.map(c => (
        <div key={c.id} className="oracle-history-row">
          <div className="oracle-history-date text-dim font-mono">{c.date.slice(0, 10)}</div>
          <div className="oracle-history-q font-serif">"{c.question}"</div>
          <div className="oracle-history-draws text-dim">
            {c.subject.name} × {c.card.name}
          </div>
          <div className="oracle-history-reading">{c.reading.slice(0, 180)}…</div>
        </div>
      ))}
    </div>
  )
}
