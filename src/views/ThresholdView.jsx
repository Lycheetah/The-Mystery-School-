import React, { useState, useEffect, useRef } from 'react'
import './ThresholdView.css'

const CRISIS_LINES = [
  { country: 'NZ',   name: '1737',          number: '1737',         desc: 'Free to call or text, 24/7' },
  { country: 'NZ',   name: 'Lifeline NZ',   number: '0800 543 354', desc: 'Free 24/7 crisis support' },
  { country: 'AU',   name: 'Lifeline AU',   number: '13 11 14',     desc: '24/7 crisis support' },
  { country: 'AU',   name: 'Beyond Blue',   number: '1300 22 4636', desc: '24/7, anxiety, depression' },
  { country: 'UK',   name: 'Samaritans',    number: '116 123',      desc: 'Free 24/7' },
  { country: 'US',   name: '988 Lifeline',  number: '988',          desc: 'Mental health crisis, 24/7' },
  { country: 'INTL', name: 'Find A Line',   url: 'https://findahelpline.com', desc: 'International directory' },
]

const BOX_PHASES = [
  { label: 'Breathe in',  duration: 4000, scaleTarget: 1,    colour: '#4A4070' },
  { label: 'Hold',        duration: 4000, scaleTarget: 1,    colour: '#6A5A90' },
  { label: 'Breathe out', duration: 4000, scaleTarget: 0.28, colour: '#3A3060' },
  { label: 'Hold',        duration: 4000, scaleTarget: 0.28, colour: '#5A4888' },
]

export default function ThresholdView({ onBack }) {
  const [breathActive, setBreathActive] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [countdown, setCountdown] = useState(4)
  const [circleScale, setCircleScale] = useState(0.28)
  const [circleColour, setCircleColour] = useState('#3A3060')
  const [copied, setCopied] = useState(null)

  const timerRef = useRef(null)
  const countRef = useRef(null)
  const activeRef = useRef(false)

  function startBreath() {
    activeRef.current = true
    setBreathActive(true)
    runPhase(0)
  }

  function stopBreath() {
    activeRef.current = false
    setBreathActive(false)
    clearTimeout(timerRef.current)
    clearInterval(countRef.current)
    setCircleScale(0.28)
    setCircleColour('#3A3060')
    setCountdown(4)
  }

  function runPhase(idx) {
    if (!activeRef.current) return
    const phase = BOX_PHASES[idx % BOX_PHASES.length]
    setPhaseIdx(idx % BOX_PHASES.length)
    setCircleScale(phase.scaleTarget)
    setCircleColour(phase.colour)
    setCountdown(4)

    let c = 4
    countRef.current = setInterval(() => {
      c -= 1
      setCountdown(c > 0 ? c : 0)
      if (c <= 0) clearInterval(countRef.current)
    }, 1000)

    timerRef.current = setTimeout(() => {
      if (activeRef.current) runPhase(idx + 1)
    }, phase.duration)
  }

  useEffect(() => {
    return () => {
      activeRef.current = false
      clearTimeout(timerRef.current)
      clearInterval(countRef.current)
    }
  }, [])

  function openLine(line) {
    if (line.url) {
      window.open(line.url, '_blank')
    }
  }

  function copyNumber(number) {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(number)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const currentPhase = BOX_PHASES[phaseIdx]

  return (
    <div className="threshold-view">
      <div className="threshold-scroll">

        {/* Header */}
        <div className="threshold-header">
          <h1 className="threshold-heading font-serif">You found this page.</h1>
          <p className="threshold-sub">That means something is happening.</p>
          <p className="threshold-body text-threshold-dim">
            You don't have to explain it. You don't have to figure it out right now.
            Just stay here for a moment.
          </p>
        </div>

        {/* Box breathing */}
        <div className="threshold-card threshold-breath-block">
          <div className="threshold-breath-title">Box breathing — 4 · 4 · 4 · 4</div>
          <div className="threshold-breath-desc text-threshold-dim">
            In for 4. Hold 4. Out for 4. Hold 4.
            This activates your parasympathetic nervous system.
          </div>

          {/* Circle */}
          <div className="threshold-circle-container">
            <div
              className="threshold-circle"
              style={{
                transform: `scale(${circleScale})`,
                borderColor: breathActive ? circleColour : '#1E1E38',
                opacity: breathActive ? 1 : 0.3,
                transition: breathActive
                  ? `transform ${currentPhase.duration - 100}ms ease-in-out, border-color 300ms ease, opacity 300ms ease`
                  : 'opacity 300ms ease',
              }}
            />
            {breathActive && (
              <div className="threshold-circle-label">
                <span className="threshold-phase-label">{currentPhase.label}</span>
                <span className="threshold-countdown font-mono">{countdown}</span>
              </div>
            )}
          </div>

          <button
            className={`threshold-breath-btn ${breathActive ? 'threshold-breath-btn--stop' : 'threshold-breath-btn--start'}`}
            onClick={breathActive ? stopBreath : startBreath}
          >
            {breathActive ? 'Stop' : 'Start breathing'}
          </button>
        </div>

        {/* Three things */}
        <div className="threshold-card threshold-three-block">
          <div className="threshold-three-title">Three things to do right now</div>
          {[
            'Name where you are physically. The room. The chair. The floor.',
            'Take one breath — just one. In through the nose, out through the mouth.',
            'You do not need to solve anything in the next five minutes.',
          ].map((step, i) => (
            <div key={i} className="threshold-three-row">
              <span className="threshold-three-num font-mono">{i + 1}</span>
              <span className="threshold-three-text">{step}</span>
            </div>
          ))}
        </div>

        {/* Crisis lines */}
        <div className="threshold-crisis-section">
          <div className="threshold-crisis-title text-threshold-dim font-mono">If you need a human voice</div>
          <div className="threshold-crisis-list">
            {CRISIS_LINES.map((line, i) => (
              line.url ? (
                <button
                  key={i}
                  className="threshold-crisis-line threshold-crisis-line--link"
                  onClick={() => openLine(line)}
                >
                  <div>
                    <div className="threshold-crisis-name">{line.name}</div>
                    <div className="threshold-crisis-desc text-threshold-dim">{line.desc}</div>
                  </div>
                  <span className="threshold-crisis-number font-mono">Open →</span>
                </button>
              ) : (
                <div key={i} className="threshold-crisis-line">
                  <div className="threshold-crisis-line-left">
                    <div className="threshold-crisis-name">{line.name}</div>
                    <div className="threshold-crisis-desc text-threshold-dim">{line.desc}</div>
                  </div>
                  <button
                    className="threshold-crisis-number font-mono threshold-crisis-copy"
                    onClick={() => copyNumber(line.number)}
                    title="Click to copy"
                  >
                    {copied === line.number ? 'Copied ✓' : line.number}
                  </button>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Footnote */}
        <p className="threshold-footnote font-serif text-threshold-dim">
          You are not alone in this. The mathematics of the framework guarantees
          that transformation is possible from every phase. Even this one.
          Especially this one.
        </p>

        {/* Back */}
        {onBack && (
          <button className="threshold-back-btn" onClick={onBack}>
            ← Return to school
          </button>
        )}

      </div>
    </div>
  )
}
