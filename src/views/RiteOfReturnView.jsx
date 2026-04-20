import React, { useState } from 'react'
import { getStoreValue, setStoreValue } from '../hooks/useStore'
import { KEYS } from '../../data/schema'
import './RiteOfReturnView.css'

const RETURN_PROMPTS = [
  'Where were you? What happened while you were away?',
  'The school held your place. What did life ask of you?',
  'Absence is not failure. What did the fallow time teach?',
]

export default function RiteOfReturnView({ daysSince, onComplete }) {
  const [logging, setLogging] = useState(false)
  const [logText, setLogText] = useState('')
  const prompt = RETURN_PROMPTS[Math.floor(Date.now() / 86400000) % RETURN_PROMPTS.length]

  async function recordRite(choice, note = '') {
    const existing = await getStoreValue(KEYS.RETURN_RITES) || []
    await setStoreValue(KEYS.RETURN_RITES, [
      ...existing,
      { date: new Date().toISOString(), choiceMade: choice, note },
    ])
    // Pause streak — don't add absence days to missed count
    const currentPause = await getStoreValue(KEYS.STREAK_PAUSE_DAYS) || 0
    await setStoreValue(KEYS.STREAK_PAUSE_DAYS, currentPause + daysSince)
    onComplete(choice)
  }

  if (logging) {
    return (
      <div className="rite-screen">
        <div className="rite-content">
          <div className="rite-glyph">⊚</div>
          <h2 className="rite-title">Welcome back.</h2>
          <p className="rite-prompt">{prompt}</p>
          <textarea
            className="rite-log-input"
            placeholder="Write freely. There is no wrong answer."
            value={logText}
            onChange={e => setLogText(e.target.value)}
            autoFocus
          />
          <div className="rite-actions">
            <button
              className="rite-btn rite-btn--primary"
              onClick={() => recordRite('log', logText)}
            >
              Seal and Enter
            </button>
            <button className="rite-btn rite-btn--ghost" onClick={() => setLogging(false)}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rite-screen">
      <div className="rite-content">
        <div className="rite-glyph">⊚</div>
        <h2 className="rite-title">Welcome back.</h2>
        <p className="rite-subtitle">
          You've been away for {daysSince} {daysSince === 1 ? 'day' : 'days'}.
          <br />
          The school held your place.
        </p>
        <p className="rite-note">Your streak is preserved — absence is not failure.</p>

        <div className="rite-choices">
          <button
            className="rite-choice"
            onClick={() => recordRite('recenter')}
          >
            <span className="rite-choice-glyph">◎</span>
            <span className="rite-choice-label">Re-centre</span>
            <span className="rite-choice-desc">A short practice to ground your return</span>
          </button>

          <button
            className="rite-choice"
            onClick={() => setLogging(true)}
          >
            <span className="rite-choice-glyph">✦</span>
            <span className="rite-choice-label">Log what happened</span>
            <span className="rite-choice-desc">Write what the time away brought</span>
          </button>

          <button
            className="rite-choice rite-choice--ghost"
            onClick={() => recordRite('browse')}
          >
            <span className="rite-choice-glyph">→</span>
            <span className="rite-choice-label">Enter the school</span>
            <span className="rite-choice-desc">Continue where you left off</span>
          </button>
        </div>
      </div>
    </div>
  )
}
