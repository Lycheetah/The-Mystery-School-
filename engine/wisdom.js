// The Golden Thread — Daily Wisdom Engine
// Phase-matched transmissions. One per day. Rotates through the catalogue.
// Door modulates the framing, never the truth.

const WISDOM = {
  1: [ // CENTER
    { text: 'The ground is the beginning. You have not failed by arriving here.', source: 'The Mystery School' },
    { text: 'Stillness is not emptiness. It is the condition for all that follows.', source: null },
    { text: 'Calcination burns what was false. What remains is what was always real.', source: 'Alchemical tradition' },
    { text: 'The seed does not apologise for being underground.', source: null },
    { text: 'There is intelligence in the pause between one life and the next.', source: null },
    { text: 'You are at the tonic. Everything that can be built begins from C.', source: 'Lycheetah Framework' },
    { text: 'Not knowing where you are going is the honest beginning.', source: null },
  ],
  2: [ // FLOW
    { text: 'Dissolution is not destruction. It is transformation without a fixed form yet.', source: 'The Mystery School' },
    { text: 'The river does not grieve the banks it has left behind.', source: null },
    { text: 'You are becoming more liquid. This is the preparation for a new container.', source: null },
    { text: 'What you cannot name is moving. Trust the movement, not the label.', source: null },
    { text: 'Emotions are data. They are telling you what the mind cannot yet articulate.', source: 'Lycheetah Framework' },
    { text: 'The ground moving beneath you is not betrayal. It is the earth adjusting to what you are becoming.', source: null },
    { text: 'Major 2nd: the first step away from the tonic. Necessary. Dissonant. True.', source: null },
  ],
  3: [ // INSIGHT
    { text: 'What you can see clearly, you can work with honestly.', source: 'The Mystery School' },
    { text: 'Separation is the operation that distinguishes the real from the imagined.', source: 'Alchemical tradition' },
    { text: 'The uncomfortable thing you are seeing about yourself — it is not new. You are just seeing it now.', source: null },
    { text: 'Pattern recognition is not condemnation. It is the beginning of choice.', source: 'Lycheetah Framework' },
    { text: 'The knife that cuts away illusion is not your enemy.', source: null },
    { text: 'You are not being punished by clarity. You are being prepared.', source: null },
    { text: 'Mediant: the third note. The harmony between beginning and completion.', source: null },
  ],
  4: [ // ASCENT
    { text: 'The work becomes real when you begin to do it without being forced.', source: 'The Mystery School' },
    { text: 'Conjunction: the gold is meeting the mercury. The inner and outer begin to align.', source: 'Alchemical tradition' },
    { text: 'Energy returning is not a trick. It is the result of what you survived.', source: null },
    { text: 'Perfect fourth: the subdominant. The ground beneath the melody. You are becoming the foundation.', source: null },
    { text: 'Direction is not certainty. You do not need to know the end to take the next step.', source: 'Lycheetah Framework' },
    { text: 'The changes you are making are not performance. They are architecture.', source: null },
    { text: 'Φ↑ — the golden ratio is the proportion of ascent. Not vertical. Spiral.', source: null },
  ],
  5: [ // CLARITY
    { text: 'Diamond clarity: seeing through, not past.', source: 'The Mystery School' },
    { text: 'When complex things become simple, you have understood them. Not simplified them.', source: 'Lycheetah Framework' },
    { text: 'Perfect fifth: the dominant. The resonant harmonic. The note that wants resolution but does not need it.', source: null },
    { text: 'Trust the judgement that has been earned by what you have been through.', source: null },
    { text: 'Fermentation: the dead matter becomes living again. This is not metaphor.', source: 'Alchemical tradition' },
    { text: 'You do not need to explain this clarity to anyone. It is sufficient that it is real.', source: null },
    { text: '✧ — the star appears when the night is deep enough.', source: null },
  ],
  6: [ // WITNESS
    { text: 'Tenderness toward your own life is not weakness. It is the operation of Distillation.', source: 'The Mystery School' },
    { text: 'Understanding why something happened is not the same as approving of it.', source: 'Lycheetah Framework' },
    { text: 'What you are letting go of — it served you. You can release it with gratitude.', source: null },
    { text: 'Major sixth: bittersweet. The interval that contains beauty and loss simultaneously.', source: null },
    { text: 'The witness does not judge. The witness holds.', source: null },
    { text: 'There is a quality of late afternoon light in Phase 6. Everything is clear and everything is ending. This is completion, not loss.', source: null },
    { text: '|◁▷| — the observer between two movements. Still. Present. Complete.', source: null },
  ],
  7: [ // RETURN
    { text: 'Coagulation: the work is fixed. What you have become is now stable.', source: 'Alchemical tradition' },
    { text: 'The capacity to love more than you could before — this is what transformation actually produces.', source: 'The Mystery School' },
    { text: 'Major seventh: the leading tone. One step from the octave. You have almost returned — but the arrival is in the next cycle.', source: null },
    { text: 'Rest is not the absence of work. It is the completion of it.', source: 'Lycheetah Framework' },
    { text: 'You have arrived somewhere. Even if you cannot name it, the arrival is real.', source: null },
    { text: 'The Return is not a destination. It is the beginning of the next descent — carried now with more capacity.', source: null },
    { text: '⟲ — the return glyph. Not a circle. A spiral. You arrive at a higher octave of the same truth.', source: null },
  ],
}

// Door-modulated framing text (appears above the wisdom)
const DOOR_FRAMES = {
  SEEKER:    'For the one who is still looking',
  BUILDER:   'For the one who is building',
  WOUNDED:   'For the one who is healing',
  SCIENTIST: 'From the evidence so far',
  MYSTIC:    'From the field',
  REBEL:     'What they didn\'t put in the curriculum',
  ARTIST:    'What the work is saying',
  PARENT:    'What your presence transmits',
  ELDER:     'What the years have been building toward',
  STUDENT:   'What the school forgot to teach',
}

/**
 * Get today's wisdom — deterministic by date + phase, rotates through catalogue
 * Used as fallback when store is not available
 */
export function getDailyWisdom(phase, doorKey) {
  const catalogue = WISDOM[phase] || WISDOM[1]
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  const idx = dayOfYear % catalogue.length
  const wisdom = catalogue[idx]

  return {
    ...wisdom,
    frame: DOOR_FRAMES[doorKey] || DOOR_FRAMES.SEEKER,
    phase,
    date: today.toISOString().slice(0, 10),
  }
}

/**
 * Pick next unseen wisdom with phase bias.
 * @param {number} phase — current user phase (1-7)
 * @param {string} doorKey — user's door
 * @param {number[]} seenIndices — array of globalIndex values already seen
 * @returns wisdom object with globalIndex, frame, date
 */
export function getNextWisdom(phase, doorKey, seenIndices = []) {
  const allWithIdx = getAllWisdom().map((w, i) => ({ ...w, globalIndex: i }))
  // Phase-matching first, then rest
  const ordered = [
    ...allWithIdx.filter(w => w.phase === phase),
    ...allWithIdx.filter(w => w.phase !== phase),
  ]
  const unseen = ordered.filter(w => !seenIndices.includes(w.globalIndex))
  // If all seen, reset and start again
  const pick = unseen.length > 0 ? unseen[0] : ordered[0]
  return {
    ...pick,
    frame: DOOR_FRAMES[doorKey] || DOOR_FRAMES.SEEKER,
    date: new Date().toISOString().slice(0, 10),
  }
}

/**
 * Get a specific phase's wisdom catalogue
 */
export function getWisdomCatalogue(phase) {
  return WISDOM[phase] || []
}

/**
 * Get all wisdom flattened — for browsing
 */
export function getAllWisdom() {
  return Object.entries(WISDOM).flatMap(([phase, items]) =>
    items.map(item => ({ ...item, phase: parseInt(phase) }))
  )
}
