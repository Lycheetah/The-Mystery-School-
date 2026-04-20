import React, { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore'
import { DOORS } from '../../engine/doors'
import {
  QUESTIONS, DEPTH_QUESTIONS, PHASES, DEPTH_INFO,
  buildFlatQuestions, calculateResult
} from '../../engine/assessment'
import CovenantView from './CovenantView'
import './Onboarding.css'

const SCORE_LABELS = ['Not at all', 'A little', 'Quite a bit', 'Very much']

// Phase transition texts — what it means to cross each threshold
const THRESHOLD_TEXT = {
  '1→2': 'The stillness has done its work. What was waiting now begins to move.',
  '2→3': 'The movement has found its meaning. What was flowing now becomes visible.',
  '3→4': 'The seeing is complete. What was insight now becomes direction.',
  '4→5': 'The building has clarified everything. What was effort now becomes ease.',
  '5→6': 'The clarity has been earned. What was sharp now learns to rest.',
  '6→7': 'The witness has seen enough. What was watching now returns.',
  '7→1': 'The return is complete. What was movement now finds its stillness again.',
  // non-sequential
  'default': 'You have crossed a threshold. The coordinates have changed.',
}

function getThresholdText(from, to) {
  return THRESHOLD_TEXT[`${from}→${to}`] || THRESHOLD_TEXT.default
}

export default function Onboarding() {
  const [step, setStep] = useState('welcome') // welcome | doors | assessment | depth | result | ceremony | covenant
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [answers, setAnswers] = useState([]) // flat array of scores
  const [phaseScores, setPhaseScores] = useState({ 1:0,2:0,3:0,4:0,5:0,6:0,7:0 })
  const [currentQ, setCurrentQ] = useState(0)
  const [depthChoice, setDepthChoice] = useState(null) // stores index 0-3
  const [result, setResult] = useState(null)
  const { state, update } = useStore()

  const flatQuestions = buildFlatQuestions()
  const prevPhase = state?.phase || null
  const hasOnboardedBefore = state?.assessedAt != null

  // Quick re-assess: skip welcome + doors, use existing door
  useEffect(() => {
    if (state?.quickReassess && state?.door) {
      setSelectedDoor(state.door)
      setStep('assessment')
    }
  }, [])

  function handleScore(score) {
    const q = flatQuestions[currentQ]
    const newScores = { ...phaseScores, [q.phase]: phaseScores[q.phase] + score }
    setPhaseScores(newScores)
    setAnswers([...answers, score])

    if (currentQ + 1 >= flatQuestions.length) {
      setStep('depth')
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  function handleBack() {
    if (currentQ === 0) { setStep(state?.quickReassess ? 'assessment' : 'doors'); return }
    const prev = flatQuestions[currentQ - 1]
    const prevScore = answers[currentQ - 1]
    setPhaseScores({ ...phaseScores, [prev.phase]: phaseScores[prev.phase] - prevScore })
    setAnswers(answers.slice(0, -1))
    setCurrentQ(currentQ - 1)
  }

  async function handleDepthSubmit() {
    if (depthChoice === null) return
    const res = calculateResult(phaseScores, depthChoice)
    setResult(res)
    setStep('result')
  }

  function handleResultNext() {
    // Show ceremony on re-assessments where phase changed, then covenant
    if (hasOnboardedBefore && prevPhase && prevPhase !== result.phase) {
      setStep('ceremony')
    } else {
      setStep('covenant')
    }
  }

  async function handleEnter() {
    await update({
      onboarded: true,
      quickReassess: false,
      door: selectedDoor || state?.door || 'SEEKER',
      phase: result.phase,
      depth: result.depth,
      depthKey: result.depthKey,
      coordinates: result.coordinates,
      assessedAt: result.assessedAt,
    })
  }

  if (step === 'welcome') return <WelcomeStep onNext={() => setStep('doors')} />
  if (step === 'doors') return (
    <DoorStep
      selected={selectedDoor}
      onSelect={setSelectedDoor}
      onNext={() => setStep('assessment')}
    />
  )
  if (step === 'assessment') return (
    <AssessmentStep
      questions={flatQuestions}
      currentQ={currentQ}
      total={flatQuestions.length}
      onScore={handleScore}
      onBack={handleBack}
    />
  )
  if (step === 'depth') return (
    <DepthStep
      choice={depthChoice}
      onChoose={setDepthChoice}
      onSubmit={handleDepthSubmit}
    />
  )
  if (step === 'result') return (
    <ResultStep result={result} onEnter={handleResultNext} />
  )
  if (step === 'ceremony') return (
    <CeremonyStep
      prevPhase={prevPhase}
      result={result}
      onEnter={() => setStep('covenant')}
    />
  )
  if (step === 'covenant') return (
    <CovenantView onComplete={handleEnter} />
  )
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div className="welcome-glyph font-mono">⊚</div>
        <h1 className="welcome-title font-serif">The Mystery School</h1>
        <p className="welcome-sub text-dim">No mathematics required. No belief required. Just honesty.</p>
        <div className="welcome-divider" />
        <p className="welcome-body">
          This school works with where you actually are — not where you think you should be.
          A short assessment will map your current phase. Then the curriculum opens to match it.
        </p>
        <button className="btn-primary onboarding-btn" onClick={onNext}>
          Enter the School
        </button>
        <p className="welcome-crisis text-dim">
          If you are in crisis, close this and call your local emergency line.
        </p>
      </div>
    </div>
  )
}

// ─── Door selection ───────────────────────────────────────────────────────────

function DoorStep({ selected, onSelect, onNext }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-wide">
        <h2 className="door-heading font-serif">Choose your door</h2>
        <p className="door-sub text-dim">
          Every door leads to the same truth. The door shapes the language of your journey.
        </p>
        <div className="door-grid">
          {Object.values(DOORS).map(door => (
            <button
              key={door.key}
              className={`door-card ${selected === door.key ? 'door-card--selected' : ''}`}
              onClick={() => onSelect(door.key)}
            >
              <span className="door-glyph font-mono">{door.glyph}</span>
              <span className="door-name">{door.name}</span>
              <span className="door-hook text-dim">{door.hook}</span>
            </button>
          ))}
        </div>
        <button
          className="btn-primary onboarding-btn"
          disabled={!selected}
          onClick={onNext}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ─── Assessment ───────────────────────────────────────────────────────────────

function AssessmentStep({ questions, currentQ, total, onScore, onBack }) {
  const q = questions[currentQ]
  const progress = ((currentQ) / total) * 100
  const phaseColour = PHASES[q.phase]?.colour || '#8888CC'

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card assessment-card">
        {/* Progress */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, background: phaseColour }}
          />
        </div>

        {/* Phase label */}
        <div className="phase-label font-mono" style={{ color: phaseColour }}>
          {PHASES[q.phase]?.glyph} {PHASES[q.phase]?.name} · {currentQ + 1} / {total}
        </div>

        {/* Question */}
        <p className="assessment-question font-serif">{q.text}</p>

        {/* Score buttons */}
        <div className="score-grid">
          {SCORE_LABELS.map((label, i) => (
            <button
              key={i}
              className="score-btn"
              onClick={() => onScore(i)}
            >
              <span className="score-num">{i}</span>
              <span className="score-label text-dim">{label}</span>
            </button>
          ))}
        </div>

        {currentQ > 0 && (
          <button className="back-btn btn-ghost" onClick={onBack}>← Back</button>
        )}
      </div>
    </div>
  )
}

// ─── Depth ────────────────────────────────────────────────────────────────────

function DepthStep({ choice, onChoose, onSubmit }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <h2 className="depth-heading font-serif">One final question</h2>
        <p className="text-dim" style={{ marginBottom: 24, fontSize: 15 }}>
          When I entered this school today, my intention is closest to…
        </p>
        <div className="depth-options">
          {DEPTH_QUESTIONS.map((opt, i) => (
            <button
              key={i}
              className={`depth-option ${choice === i ? 'depth-option--selected' : ''}`}
              onClick={() => onChoose(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className="btn-primary onboarding-btn"
          disabled={!choice}
          onClick={onSubmit}
        >
          See my coordinates
        </button>
      </div>
    </div>
  )
}

// ─── Result ───────────────────────────────────────────────────────────────────

function ResultStep({ result, onEnter }) {
  if (!result) return null

  const phase = PHASES[result.phase]
  const depth = DEPTH_INFO[result.depth]
  const maxScore = 15

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card result-card">
        <div className="result-glyph font-mono" style={{ color: phase.colour }}>
          {phase.glyph}
        </div>
        <h2 className="result-phase font-serif" style={{ color: phase.colour }}>
          Phase {result.phase} — {phase.name}
        </h2>
        <p className="result-depth text-dim">
          {depth.symbol} {depth.name} · {depth.short}
        </p>
        <p className="result-coordinates text-dim font-mono">
          {result.coordinates}
        </p>

        {result.isNigredo && (
          <div className="nigredo-notice">
            <strong>You are in a deep place.</strong> The school is here. You do not need to rush.
            If you are in crisis, please reach out to someone — the curriculum can wait.
          </div>
        )}

        {/* Score bars */}
        <div className="score-bars">
          {Object.entries(PHASES).map(([num, ph]) => {
            const score = result.scores?.[num] || 0
            const pct = Math.round((score / maxScore) * 100)
            return (
              <div key={num} className="score-bar-row">
                <span className="score-bar-glyph font-mono" style={{ color: ph.colour }}>
                  {ph.glyph}
                </span>
                <span className="score-bar-name text-dim">{ph.name}</span>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: parseInt(num) === result.phase ? ph.colour : 'var(--border)',
                    }}
                  />
                </div>
                <span className="score-bar-pct text-dim">{score}</span>
              </div>
            )
          })}
        </div>

        <button className="btn-primary onboarding-btn" onClick={onEnter}>
          Enter the school
        </button>
      </div>
    </div>
  )
}

// ─── Phase shift ceremony ─────────────────────────────────────────────────────

function CeremonyStep({ prevPhase, result, onEnter }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600)
    return () => clearTimeout(t)
  }, [])

  const from = PHASES[prevPhase]
  const to   = PHASES[result.phase]
  const depth = DEPTH_INFO[result.depth]
  const thresholdText = getThresholdText(prevPhase, result.phase)

  return (
    <div className="ceremony-screen">
      <div className="ceremony-body">

        {/* Phase transition arc */}
        <div className="ceremony-arc">
          <div className="ceremony-from">
            <span className="ceremony-glyph-from font-mono" style={{ color: from?.colour }}>
              {from?.glyph}
            </span>
            <span className="ceremony-phase-name-from text-dim">{from?.name}</span>
          </div>

          <div className="ceremony-arrow text-dim">⟶</div>

          <div className={`ceremony-to ${revealed ? 'ceremony-to--revealed' : ''}`}>
            <span className="ceremony-glyph-to font-mono" style={{ color: to?.colour }}>
              {to?.glyph}
            </span>
            <span className="ceremony-phase-name-to font-serif" style={{ color: to?.colour }}>
              {to?.name}
            </span>
          </div>
        </div>

        {/* Operation */}
        <div className={`ceremony-operation ${revealed ? 'ceremony-fade-in' : ''}`}>
          <span className="font-mono text-dim">Phase {result.phase} · </span>
          <span style={{ color: to?.colour }}>{to?.operation}</span>
        </div>

        {/* Depth */}
        <div className={`ceremony-depth text-dim ${revealed ? 'ceremony-fade-in' : ''}`}>
          {depth?.symbol} {depth?.name} — {depth?.short}
        </div>

        {/* Threshold text */}
        <p className={`ceremony-threshold font-serif ${revealed ? 'ceremony-fade-in' : ''}`}>
          {thresholdText}
        </p>

        {/* Nigredo warning */}
        {result.isNigredo && (
          <div className={`ceremony-nigredo ${revealed ? 'ceremony-fade-in' : ''}`}>
            You are in deep water. The school holds you here.
            If you are in crisis, please reach out to a human first.
          </div>
        )}

        <button
          className={`btn-primary ceremony-btn ${revealed ? 'ceremony-fade-in' : ''}`}
          style={{ background: to?.colour, borderColor: to?.colour, color: '#000' }}
          onClick={onEnter}
          disabled={!revealed}
        >
          Cross the threshold
        </button>

      </div>
    </div>
  )
}
