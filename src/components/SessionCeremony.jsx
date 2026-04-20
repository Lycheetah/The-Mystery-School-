import React, { useState, useEffect, useRef } from 'react'
import { PHASE_COLOURS } from '../../theme/colours'
import './SessionCeremony.css'

const OPENING_LINES = {
  1: ['The ground holds you.', 'Nothing is required of you yet.', 'Stillness is the work.'],
  2: ['Something is moving.', 'You do not need to name it yet.', 'Trust the current.'],
  3: ['Your seeing is sharpened.', 'What you notice is real.', 'Look without flinching.'],
  4: ['Energy is returning.', 'Direction is forming.', 'The work is ready for you.'],
  5: ['Clarity is available.', 'You can hold more than you think.', 'Precision is your gift now.'],
  6: ['Something is completing.', 'Let it land.', 'Receive what was earned.'],
  7: ['The work has settled.', 'You are standing on what you built.', 'Begin from here.'],
}

const BREATH_PHASES = [
  { label: 'Inhale', duration: 4000 },
  { label: 'Hold',   duration: 2000 },
  { label: 'Exhale', duration: 6000 },
  { label: 'Rest',   duration: 2000 },
]

export default function SessionCeremony({ phase, onComplete }) {
  const phaseColour = PHASE_COLOURS[phase]?.colour || '#C8A96E'
  const phaseGlyph  = PHASE_COLOURS[phase]?.glyph  || '⊚'
  const lines = OPENING_LINES[phase] || OPENING_LINES[1]
  const line = lines[new Date().getHours() % lines.length]

  const [step, setStep] = useState('breath') // 'breath' | 'intention' | 'done'
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathProgress, setBreathProgress] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [intention, setIntention] = useState('')
  const intervalRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (step !== 'breath') return
    runBreathCycle(0)
    return () => clearTimeout(intervalRef.current)
  }, [step])

  function runBreathCycle(phaseIdx) {
    const phase = BREATH_PHASES[phaseIdx]
    startRef.current = Date.now()
    setBreathPhase(phaseIdx)
    setBreathProgress(0)

    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      setBreathProgress(Math.min(elapsed / phase.duration, 1))
    }, 50)

    intervalRef.current = setTimeout(() => {
      clearInterval(tick)
      const next = (phaseIdx + 1) % BREATH_PHASES.length
      if (phaseIdx === BREATH_PHASES.length - 1) {
        setCycleCount(c => {
          const newCount = c + 1
          if (newCount >= 1) {
            setStep('intention')
          } else {
            runBreathCycle(0)
          }
          return newCount
        })
      } else {
        runBreathCycle(next)
      }
    }, phase.duration)
  }

  function handleComplete() {
    onComplete(intention.trim())
  }

  function handleSkip() {
    onComplete('')
  }

  const circumference = 2 * Math.PI * 44
  const strokeDash = circumference * breathProgress

  return (
    <div className="ceremony-overlay">
      <div className="ceremony-modal">
        <button className="ceremony-skip" onClick={handleSkip}>skip</button>

        <div className="ceremony-glyph font-mono" style={{ color: phaseColour }}>
          {phaseGlyph}
        </div>

        <div className="ceremony-title font-serif">
          {step === 'breath' ? 'One breath before you begin.' : 'Set your intention.'}
        </div>

        {step === 'breath' && (
          <div className="ceremony-breath">
            <svg className="ceremony-breath-ring" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="ceremony-ring-bg" />
              <circle
                cx="50" cy="50" r="44"
                className="ceremony-ring-fill"
                style={{
                  stroke: phaseColour,
                  strokeDasharray: `${strokeDash} ${circumference}`,
                }}
              />
            </svg>
            <div className="ceremony-breath-label">
              {BREATH_PHASES[breathPhase].label}
            </div>
          </div>
        )}

        {step === 'intention' && (
          <div className="ceremony-intention-block">
            <p className="ceremony-line text-dim">{line}</p>
            <textarea
              className="ceremony-intention-input"
              placeholder="What are you bringing to this session? (optional)"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              rows={2}
              autoFocus
            />
            <button
              className="ceremony-enter-btn"
              style={{ background: phaseColour, borderColor: phaseColour }}
              onClick={handleComplete}
            >
              Enter the School
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
