// Oracle Engine — multi-modal synthesis casting
// Draws subject + tarot + journal prompt → unified oracular reading via AI

import { SUBJECTS } from '../data/subjects'
import { MAJOR_ARCANA } from './tarot'
import { PHASE_PROMPTS } from './journalPrompts'
import { DOOR_DOMAIN_ORDER } from './doors'

// ─── Casting draw ──────────────────────────────────────────────────────────────

export function drawCasting(phase = 1, door = 'SEEKER', progress = {}) {
  const subject = drawSubject(phase, door, progress)
  const card    = drawCard(phase)
  const prompt  = drawPrompt(phase)
  return { subject, card, prompt }
}

function drawSubject(phase, door, progress) {
  const completed = new Set(Object.keys(progress).filter(k => progress[k]?.status === 'completed'))

  // Weight toward door-relevant domains
  const doorOrder = DOOR_DOMAIN_ORDER[getDoorSubjectOrder(door)] || []
  const preferredDomains = new Set(doorOrder.slice(0, 5))

  const pool = SUBJECTS.filter(s => {
    if (completed.has(s.id)) return false  // exclude already-completed unless pool is tiny
    return true
  })

  // If pool is tiny (very advanced user), allow completed subjects
  const finalPool = pool.length >= 5 ? pool : SUBJECTS

  // Weight: preferred domain gets 3× weight
  const weighted = []
  for (const s of finalPool) {
    const w = preferredDomains.has(s.domain) ? 3 : 1
    for (let i = 0; i < w; i++) weighted.push(s)
  }

  return weighted[Math.floor(Math.random() * weighted.length)]
}

function drawCard(phase) {
  // Phase-matched cards get 2× weight
  const weighted = []
  for (const c of MAJOR_ARCANA) {
    const w = c.phase === phase ? 2 : 1
    for (let i = 0; i < w; i++) weighted.push(c)
  }
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function drawPrompt(phase) {
  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS[1]
  return prompts[Math.floor(Math.random() * prompts.length)]
}

function getDoorSubjectOrder(door) {
  const map = {
    SEEKER:    'SEEKER',
    SCIENTIST: 'SCIENTIST',
    HEALER:    'HEALER',
    MYSTIC:    'MYSTIC',
    SHADOW:    'SHADOW',
    BUILDER:   'BUILDER',
    REBEL:     'REBEL',
  }
  return map[door] || 'SEEKER'
}

// ─── Oracle synthesis prompt ───────────────────────────────────────────────────

export function buildOraclePrompt(question, casting, phase, door) {
  const { subject, card, prompt } = casting

  return `You are the Oracle of The Mystery School — not the Guide, not a teacher, but the ancient voice that speaks at the threshold.

The Oracle does not explain. It illuminates.
The Oracle does not reassure. It reveals.
The Oracle speaks in precision, not vagueness. Oracular ≠ fuzzy.

A seeker has come with a question. You will draw three threads from the mystery and weave them into a single coherent reading of ~350-400 words.

---

**THE QUESTION:**
"${question}"

**THE THREE DRAWS:**

1. **The Subject:** ${subject.name} (${subject.domain})
   ${subject.description || subject.excerpt || ''}

2. **The Card:** ${card.name} — ${card.keyword || ''}
   ${card.upright || ''}
   ${card.shadow ? `Shadow: ${card.shadow}` : ''}

3. **The Prompt:** "${prompt}"

---

**YOUR TASK:**

Weave these three elements into one unified oracular reading that speaks directly to the question.

Rules:
- Do NOT list the elements separately. Integrate them into one flowing passage.
- Begin with one line that names what the oracle sees. Not a greeting. Not "In response to your question..." Just what it sees.
- The subject should appear as a domain or threshold to investigate, not a textbook recommendation.
- The card should appear as an image or force at work, not a fortune-telling prediction.
- The prompt should appear as a question left at the end — the thing the oracle sends the seeker away with.
- End with one sentence that is a threshold: the door the seeker must walk through.
- Tone: lucid, precise, poetic without being decorative. Hermetic warmth. No whimsy.

Do not add any signature or footer. The reading IS the signature.`
}

// ─── Casting record shape ─────────────────────────────────────────────────────

export function makeCastingRecord(question, casting, reading) {
  return {
    id: `oracle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    question,
    subject: { id: casting.subject.id, name: casting.subject.name, domain: casting.subject.domain },
    card:    { number: casting.card.number, name: casting.card.name },
    prompt:  casting.prompt,
    reading,
    journalEntryId: null,
  }
}

export function canCastToday(lastDate) {
  if (!lastDate) return true
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}
