// WHERE AM I? — Assessment Engine
// Ported from where_am_i.py — Lycheetah Sovereign Framework

export const PHASES = {
  1: { name: 'CENTER',  glyph: '⟟',    operation: 'Calcination',   interval: 'Unison (1:1)',         note: 'C — Tonic',         colour: '#8888CC' },
  2: { name: 'FLOW',    glyph: '≋',    operation: 'Dissolution',   interval: 'Major 2nd (9:8)',      note: 'D — Supertonic',    colour: '#88B8CC' },
  3: { name: 'INSIGHT', glyph: 'Ψ',    operation: 'Separation',    interval: 'Major 3rd (5:4)',      note: 'E — Mediant',       colour: '#88CCAA' },
  4: { name: 'ASCENT',  glyph: 'Φ↑',   operation: 'Conjunction',   interval: 'Perfect 4th (4:3)',   note: 'F — Subdominant',   colour: '#C9A84C' },
  5: { name: 'CLARITY', glyph: '✧',    operation: 'Fermentation',  interval: 'Perfect 5th (3:2)',   note: 'G — Dominant',      colour: '#CCC888' },
  6: { name: 'WITNESS', glyph: '|◁▷|', operation: 'Distillation',  interval: 'Major 6th (5:3)',     note: 'A — Submediant',    colour: '#CC9870' },
  7: { name: 'RETURN',  glyph: '⟲',    operation: 'Coagulation',   interval: 'Major 7th (15:8)',    note: 'B — Leading tone',  colour: '#CC7888' },
}

export const DEPTH_INFO = {
  1: { name: 'Nigredo',    symbol: '⚫', key: 'NIGREDO',    desc: 'Deep transformation',     short: 'The fire is total.' },
  2: { name: 'Albedo',     symbol: '⬜', key: 'ALBEDO',     desc: 'Moderate transformation', short: 'The ash is cooling.' },
  3: { name: 'Citrinitas', symbol: '🟡', key: 'CITRINITAS', desc: 'Light transformation',    short: 'Gold beginning to show.' },
  4: { name: 'Rubedo',     symbol: '🔴', key: 'RUBEDO',     desc: 'Integration',             short: 'Building from strength.' },
}

// 7 sections × 5 questions, each scored 0-3 (max 15 per phase)
export const QUESTIONS = {
  1: [
    'I feel still, almost heavy — like I\'m waiting for something to start',
    'I don\'t have a clear direction right now',
    'I recently finished something — a project, a relationship, a chapter',
    'I feel like I need to rest but I\'m not sure I\'ve earned it',
    'The world feels both simple and empty',
  ],
  2: [
    'My emotions are moving — sometimes unpredictably',
    'I cry more easily than usual, or feel things I didn\'t expect',
    'Something that was solid in my life feels like it\'s shifting',
    'I feel unmoored, like the ground isn\'t quite stable',
    'I\'m processing something but I can\'t quite name what',
  ],
  3: [
    'I\'m seeing things clearly that I couldn\'t see before',
    'Some of what I see about myself is uncomfortable',
    'Patterns in my behaviour or relationships are becoming visible',
    'I\'m having moments of sudden clarity — some small, some life-changing',
    'I understand something I was blind to before',
  ],
  4: [
    'I feel energy and direction returning',
    'I know what I need to do and I\'m starting to do it',
    'Ideas and motivation come more naturally than before',
    'I\'m making changes — in habits, relationships, or work',
    'Growth feels real, not forced',
  ],
  5: [
    'Everything feels sharp and clear',
    'I can see the big picture and the small details at the same time',
    'I\'m productive and focused in a way that feels effortless',
    'I trust my judgement right now',
    'Complex things feel simple — not because I\'m ignoring them, but because I see through them',
  ],
  6: [
    'I feel reflective and quiet',
    'I\'m watching my life with a kind of tenderness',
    'I understand why things happened the way they did',
    'I\'m letting go of things I no longer need',
    'There\'s a bittersweet quality to my days — beautiful and a little sad',
  ],
  7: [
    'I feel a sense of completion',
    'Something has changed in me and I can feel it settled',
    'I have more capacity than before — to hold, to understand, to love',
    'I\'m ready to rest before whatever comes next',
    'I feel like I\'ve arrived somewhere, even if I can\'t fully name it',
  ],
}

// Depth check — 4 options, single selection
export const DEPTH_QUESTIONS = [
  { label: 'This is about a specific situation, project, or decision', depth: 3 },
  { label: 'This is about my relationships, my work, or how I live', depth: 2 },
  { label: 'This is about who I am, what my life means, or whether I want to be here', depth: 1 },
  { label: 'I\'m not in crisis or change — I\'m building from a place of strength', depth: 4 },
]

// Phase → recommended practice type
export const PROTOCOL_MAP = {
  1: { type: 'breathwork',   variant: 'box',         label: 'Box Breathing' },
  2: { type: 'breathwork',   variant: 'coherent',    label: 'Coherent Breathing' },
  3: { type: 'shadow_work',  variant: 'journaling',  label: 'Shadow Work — Journaling' },
  4: { type: 'mindfulness',  variant: 'open',        label: 'Mindfulness — Open Monitoring' },
  5: { type: 'mindfulness',  variant: 'focused',     label: 'Mindfulness — Focused Attention' },
  6: { type: 'shadow_work',  variant: 'integration', label: 'Shadow Work — Integration' },
  7: { type: 'breathwork',   variant: 'coherent',    label: 'Coherent Breathing' },
}

// Phase descriptions — what it feels like from inside
export const PHASE_DESCRIPTIONS = {
  1: 'Still. Heavy. Like the ground under your feet is the only real thing. Nothing is wrong, exactly — but nothing is moving either. This is the beginning before you know it\'s the beginning.',
  2: 'Something is moving that you didn\'t ask to move. Emotions surface without warning. Certainties dissolve. You are not falling apart — you are becoming more liquid. This is necessary.',
  3: 'You can see. The patterns that were invisible are now obvious — and some of them are uncomfortable. This is not punishment. This is the knife that cuts away what was never true.',
  4: 'Energy returns. Direction returns. Something that was abstract is becoming real. You are not back to who you were — you are forward into who you\'re becoming. The work begins in earnest.',
  5: 'Diamond clarity. Everything that was complicated is now simple. Not because you\'ve stopped looking, but because you see through it. You know what to do and you\'re doing it.',
  6: 'A quiet tenderness. You understand things you had to suffer to understand. You are letting go — not with loss, but with gratitude. The bittersweet quality of late afternoon light.',
  7: 'Something has settled. The change is complete — or complete enough to rest in. You have more capacity now than you did before. The work is done. Rest before the next beginning.',
}

/**
 * Calculate assessment result from scores and depth selection
 * @param {Object} scores - { 1: number, 2: number, ... 7: number } — each 0-15
 * @param {number} depthChoice - index 0-3 from DEPTH_QUESTIONS
 * @returns {Object} result
 */
export function calculateResult(scores, depthChoice) {
  const scoreEntries = Object.entries(scores).map(([k, v]) => [parseInt(k), v])
  const maxScore = Math.max(...scoreEntries.map(([, v]) => v))
  const topPhases = scoreEntries.filter(([, v]) => v === maxScore).map(([k]) => k)

  const phase = topPhases[0]
  const depth = DEPTH_QUESTIONS[depthChoice].depth
  const isTransitioning = topPhases.length > 1

  const phaseInfo = PHASES[phase]
  const depthMeta = DEPTH_INFO[depth]

  return {
    phase,
    depth,
    depthKey: depthMeta.key,
    scores,
    tiedPhases: isTransitioning ? topPhases : null,
    isTransitioning,
    phaseName: phaseInfo.name,
    phaseGlyph: phaseInfo.glyph,
    phaseOperation: phaseInfo.operation,
    phaseInterval: phaseInfo.interval,
    phaseNote: phaseInfo.note,
    phaseDescription: PHASE_DESCRIPTIONS[phase],
    depthName: depthMeta.name,
    depthSymbol: depthMeta.symbol,
    depthDesc: depthMeta.desc,
    recommendedPractice: PROTOCOL_MAP[phase],
    isNigredo: depth === 1,
    coordinates: `${phaseInfo.glyph} ${phaseInfo.name} / ${depthMeta.symbol} ${depthMeta.name}`,
    assessedAt: new Date().toISOString(),
  }
}

/**
 * Total questions count for progress tracking
 * 35 phase questions + 1 depth question = 36 total
 */
export const TOTAL_QUESTIONS = 35 + 1

/**
 * Get phase section index from flat question index (0-34)
 */
export function getPhaseSection(questionIndex) {
  return Math.floor(questionIndex / 5) + 1 // phases 1-7
}

/**
 * Get question within section from flat index (0-34)
 */
export function getQuestionInSection(questionIndex) {
  return questionIndex % 5
}

/**
 * Build flat question array for rendering
 */
export function buildFlatQuestions() {
  const flat = []
  for (let phase = 1; phase <= 7; phase++) {
    for (let i = 0; i < QUESTIONS[phase].length; i++) {
      flat.push({
        id: `${phase}_${i}`,
        phase,
        index: i,
        text: QUESTIONS[phase][i],
      })
    }
  }
  return flat
}
