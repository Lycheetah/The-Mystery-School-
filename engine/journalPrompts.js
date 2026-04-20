// Journal Prompts — Phase-aware, type-aware, rotating
// Each phase has 7+ prompts reflecting its alchemical operation
// Prompts rotate so the same one is not repeated until all are seen

export const PHASE_PROMPTS = {
  // Phase 1 — CENTER / Nigredo — Stillness, Confrontation, Descent
  1: [
    'What is breaking down right now that you have been resisting?',
    'Where in your body do you feel the weight of this phase?',
    'What are you afraid to admit to yourself?',
    'Name the grief you have been postponing.',
    'What identity are you being asked to release?',
    'What would you have to stop pretending in order to tell the truth right now?',
    'Describe the thing you have been circling for months without landing.',
    'What is the cost of staying where you are? What is the cost of moving?',
  ],

  // Phase 2 — FLOW / Albedo beginning — Movement, Emergence, Allowing
  2: [
    'What is flowing through you right now that you have not named?',
    'Describe a moment in the last week when you were fully present.',
    'What is wanting to emerge that you keep interrupting?',
    'Where are you allowing yourself to be moved by life?',
    'What became possible when you stopped forcing it?',
    'Where are you in motion, even when it does not feel like movement?',
    'What is the quality of attention you are bringing to your life right now?',
    'Describe the feeling of something beginning — not what it is, the feeling of it.',
  ],

  // Phase 3 — INSIGHT / Albedo deepening — Pattern, Clarity, Seeing
  3: [
    'What pattern have you been unable to see until now?',
    'Record the insight that arrived when you were not looking.',
    'What connection has formed between two things you thought were separate?',
    'Where is clarity trying to break through?',
    'What became visible when you stopped performing for the mirror?',
    'Describe the moment the fog lifted, even briefly.',
    'What did you see about yourself that you cannot unsee?',
    'Where has the truth been obvious all along, and you did not want to look?',
  ],

  // Phase 4 — RISE / Citrinitas — Ascent, Threshold, New Capacity
  4: [
    'What new capacity is trying to form in you?',
    'What would you attempt if failure were not the point?',
    'Where are you being asked to step forward?',
    'What is the threshold you are standing at?',
    'What no longer fits the person you are becoming?',
    'Describe the version of yourself that you are afraid to believe is possible.',
    'What will you have to give up in order to rise?',
    'Where is your energy pooling? What is it building toward?',
  ],

  // Phase 5 — CLARITY / Citrinitas peak — Synthesis, Gold, Integration
  5: [
    'What have you synthesised from the chaos?',
    'Where do you see the pattern in what seemed random?',
    'What two things that seemed opposed are actually one?',
    'What understanding have you arrived at that cannot be taken away?',
    'Describe what it feels like to hold a contradiction without needing to resolve it.',
    'What is the gold that has come out of the burning?',
    'Where has suffering been useful — not justified, useful?',
    'What does clarity require of you now that you have it?',
  ],

  // Phase 6 — WITNESS / Rubedo beginning — Integrity, Depth, Holding
  6: [
    'What is the deepest truth you are currently holding?',
    'Where are you being asked to witness without flinching?',
    'Describe the still point you have found.',
    'What does integrity require of you right now?',
    'What would you say to someone entering the phase you have just come through?',
    'Where are you tempted to look away from your own life?',
    'What is stable in you now that was not stable before?',
    'Describe the quality of silence that has become available to you.',
  ],

  // Phase 7 — RETURN / Rubedo — Completion, Bringing Back, Transmission
  7: [
    'What are you returning from?',
    'What have you brought back from the edge?',
    'How has the journey changed the one who set out?',
    'What wisdom can only be given from having survived this?',
    'What are you now able to offer that you could not have offered before?',
    'Describe the person you were at the beginning of this cycle and the person you are now.',
    'What gift does your wound become when it is fully metabolised?',
    'What does the return ask of you — not the arrival, the continuing?',
  ],
}

export const DREAM_PROMPTS = [
  'Describe the dream as fully as you can — setting, figures, atmosphere, emotional tone.',
  'What was the most charged moment in the dream? Stay with that image.',
  'Who appeared in the dream? What quality do they carry for you?',
  'What did the dream want you to notice?',
  'If this dream were a message from the part of you that cannot lie, what is it saying?',
  'What element (earth, water, fire, air) dominated the dream? What does that element mean to you?',
]

export const SHADOW_PROMPTS = [
  'Name the quality in someone else that triggered you this week. Now own it — where does this quality live in you?',
  'What emotion did you suppress today? Where did you feel it in the body before it was suppressed?',
  'Complete the sentence: "I would never..." and then write 300 words about when you did.',
  'What do you most wish people could not see in you?',
  'Describe the part of yourself you have been most ashamed of. When did that shame begin?',
  'What does your anger know that your politeness refuses to say?',
]

export const INSIGHT_PROMPTS = [
  'Record the insight before it fades. Full form, no editing.',
  'Where did this understanding come from? What conditions allowed it to arrive?',
  'What action does this insight require?',
  'What does this insight contradict in your previous understanding?',
  'If this insight is true, what else must be true?',
]

// Get a prompt for the given phase and type, rotating through available prompts
// Uses seenKey array in progress to avoid repeats until all are seen
export function getPhasePrompt(phase, seenIndices = []) {
  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS[1]
  const unseen = prompts
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => !seenIndices.includes(i))

  if (unseen.length === 0) {
    // All seen — reset and pick random
    const idx = Math.floor(Math.random() * prompts.length)
    return { text: prompts[idx], index: idx, reset: true }
  }

  const pick = unseen[Math.floor(Math.random() * unseen.length)]
  return { text: pick.p, index: pick.i, reset: false }
}

export function getTypedPrompt(type) {
  if (type === 'dream') {
    return DREAM_PROMPTS[Math.floor(Math.random() * DREAM_PROMPTS.length)]
  }
  if (type === 'shadow') {
    return SHADOW_PROMPTS[Math.floor(Math.random() * SHADOW_PROMPTS.length)]
  }
  if (type === 'insight') {
    return INSIGHT_PROMPTS[Math.floor(Math.random() * INSIGHT_PROMPTS.length)]
  }
  return null
}
