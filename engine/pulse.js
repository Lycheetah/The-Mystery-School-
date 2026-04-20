// Weekly Pulse — Periodic Re-Assessment
// 7 questions, one per phase dimension. Runs every 7 days.
// Not a full diagnosis — a pulse check. Compares to last ASSESSMENT scores.
// If phase shifts: return phaseChanged = true so caller can trigger ceremony.

import { PHASES } from './assessment'

// One question per phase dimension — simple 1-5 scale
export const PULSE_QUESTIONS = [
  {
    phase: 1,
    id: 'q_stillness',
    question: 'How grounded do you feel in your body right now?',
    low: 'Scattered, unanchored',
    high: 'Rooted, steady',
  },
  {
    phase: 2,
    id: 'q_flow',
    question: 'Is there a sense of movement or direction in your life?',
    low: 'Stuck, stagnant',
    high: 'Moving, alive',
  },
  {
    phase: 3,
    id: 'q_insight',
    question: 'How clearly are you seeing yourself and your patterns?',
    low: 'Foggy, confused',
    high: 'Clear, seeing',
  },
  {
    phase: 4,
    id: 'q_rise',
    question: 'How much energy do you have for what you are building?',
    low: 'Depleted, falling back',
    high: 'Rising, building',
  },
  {
    phase: 5,
    id: 'q_synthesis',
    question: 'How integrated does your inner and outer life feel?',
    low: 'Fragmented, contradictory',
    high: 'Whole, coherent',
  },
  {
    phase: 6,
    id: 'q_witness',
    question: 'How much can you hold difficult truths without flinching?',
    low: 'Avoidant, defended',
    high: 'Present, unflinching',
  },
  {
    phase: 7,
    id: 'q_return',
    question: 'How fully are you inhabiting who you have become?',
    low: 'Still becoming, incomplete',
    high: 'Arrived, transmitting',
  },
]

// Score answers to phase number
// Weighted average of all 7 answers, with phase score = highest-weighted phase
export function scorePulse(answers) {
  // answers: { q_stillness: 1-5, q_flow: 1-5, ... }
  let bestPhase = 1
  let bestScore = 0

  PULSE_QUESTIONS.forEach(q => {
    const val = answers[q.id] || 3
    if (val > bestScore) {
      bestScore = val
      bestPhase = q.phase
    }
  })

  // Use the phase where the user scored highest
  // Tie-break: prefer lower phases (earlier in journey)
  const phaseScores = PULSE_QUESTIONS.reduce((acc, q) => {
    acc[q.phase] = (acc[q.phase] || 0) + (answers[q.id] || 3)
    return acc
  }, {})

  let winnerPhase = 1
  let winnerScore = 0
  Object.entries(phaseScores).forEach(([p, s]) => {
    if (s > winnerScore) {
      winnerScore = s
      winnerPhase = parseInt(p)
    }
  })

  return {
    phase: winnerPhase,
    phaseScores,
    phaseName: PHASES[winnerPhase]?.name || 'CENTER',
    phaseGlyph: PHASES[winnerPhase]?.glyph || '⟟',
  }
}

// Should we show the weekly pulse prompt?
export function shouldShowPulse(weeklyPulse) {
  if (!weeklyPulse || !weeklyPulse.length) return true
  const last = weeklyPulse[weeklyPulse.length - 1]
  if (!last?.date) return true
  const daysSince = (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)
  return daysSince >= 7
}
