// Wheel of the Year — 8 seasonal thresholds, hemisphere-aware
// Practices, readings, and journal prompts for each turning

export const WHEEL_NODES = {
  'Spring Equinox': {
    glyph:   '♈',
    energy:  'emergence',
    themes:  ['awakening', 'seeding', 'balance restored', 'the return of light'],
    practice: 'Spend 10 minutes in morning light. Notice what is beginning to move in you.',
    reading:  'The equinox is the moment when dark and light are perfectly balanced — and then the light wins. Something that has been dormant is asking to be seeded. What do you want to grow this season?',
    prompt:   'What seed am I planting today — in my inner life — that I want to harvest by autumn?',
    subjects: ['the_self', 'intention_setting', 'archetypes_of_spring', 'rebirth'],
  },
  'Beltane': {
    glyph:   '✿',
    energy:  'vitality',
    themes:  ['life force', 'union', 'creative fire', 'the peak of spring'],
    practice: 'Move your body for 20 minutes — dance, walk, anything that feels alive. This is a threshold of vitality.',
    reading:  'Beltane is the peak of spring — the moment when life force is at its highest expression. The fires were lit to call in abundance, to honour the sacred marriage of inner and outer. What in you is most alive right now?',
    prompt:   'Where is my creative and vital energy pointing? What am I being called to create, begin, or celebrate?',
    subjects: ['creative_fire', 'sacred_sexuality', 'life_force', 'union'],
  },
  'Summer Solstice': {
    glyph:   '☀',
    energy:  'expansion',
    themes:  ['peak light', 'full expression', 'the turning', 'outward completion'],
    practice: 'Sit in the sun at noon if possible. Feel the peak. Notice what you have built since winter.',
    reading:  'The longest day. The sun at its zenith. Everything that was seeded in spring is now in full expression. But the solstice is also a turning — after this, the light begins to return inward. What have you expressed? What is ready to be witnessed and received?',
    prompt:   'What have I brought to full expression since the last turning? What does it mean to be seen, fully?',
    subjects: ['peak_states', 'shadow_integration', 'full_expression'],
  },
  'Lughnasadh': {
    glyph:   '⊕',
    energy:  'harvest',
    themes:  ['first fruits', 'gratitude', 'sacrifice', 'what must be given'],
    practice: 'Prepare and eat a meal mindfully. Acknowledge what has been given — by the earth, by others, by your past self.',
    reading:  'Lughnasadh is the first harvest — the moment when you begin to reap what was sown. But every harvest requires sacrifice: the grain must be cut, the fruit must be taken from the vine. What are you harvesting? And what must you surrender to receive it fully?',
    prompt:   'What am I harvesting from the seeds I planted in spring? What must I release to receive fully?',
    subjects: ['gratitude', 'sacrifice', 'abundance'],
  },
  'Autumn Equinox': {
    glyph:   '⚖',
    energy:  'balance',
    themes:  ['equal night', 'descent beginning', 'reflection', 'preparation'],
    practice: 'Review the year so far. Write three things you are grateful for and three things you are releasing.',
    reading:  'The second equinox — dark and light equal again, but now the dark is winning. The harvest continues. The inner work deepens. This is the threshold of descent, of preparation, of honest reckoning with what the year has been.',
    prompt:   'What is asking to be released as I prepare for the descent? What am I carrying that is not mine to keep?',
    subjects: ['letting_go', 'integration', 'reflection'],
  },
  'Samhain': {
    glyph:   '◯',
    energy:  'descent',
    themes:  ['the thinning veil', 'ancestors', 'death and rebirth', 'the underworld'],
    practice: 'Light a candle for something or someone you have lost. Sit with it for 10 minutes. Let yourself feel.',
    reading:  'The veil is thinnest now. Samhain is not about death as ending — it is about death as threshold. The ancestors are close. What has ended that deserves to be honoured? What is crossing from this life to the next in you?',
    prompt:   'What in me is dying this year — a belief, an identity, a way of being — and how do I want to honour its passing?',
    subjects: ['death_work', 'grief', 'ancestors', 'shadow'],
  },
  'Winter Solstice': {
    glyph:   '❄',
    energy:  'stillness',
    themes:  ['the longest night', 'the seed in the dark', 'the return of light', 'gestation'],
    practice: 'Sit in silence for 15 minutes in the dark — or near candlelight. Do not fill the silence. Let the dark hold you.',
    reading:  'The longest night. The deepest stillness. The seed at the centre of the earth. Everything that has died has gone underground. The light is about to return — but not yet. This moment is sacred precisely because nothing is happening. Rest. The light will come from inside before it arrives outside.',
    prompt:   'What is gestating in me in the dark? What wants to be born at the return of the light?',
    subjects: ['stillness', 'meditation', 'gestation', 'the_dark'],
  },
  'Imbolc': {
    glyph:   '∗',
    energy:  'quickening',
    themes:  ['first stirring', 'the return of Brigid', 'purification', 'early fire'],
    practice: 'Light a candle at dusk. Declare one intention for the coming season out loud. Then tend the flame for 5 minutes.',
    reading:  'Imbolc is the first breath after the long sleep. The light is returning, slowly. The ground is still cold, but something is stirring underneath. This is the feast of early fire — the spark before the flame. What is beginning to quicken in you after the winter?',
    prompt:   'What is the first, small movement of the new — in my body, my work, my inner life — that I can tend and feed?',
    subjects: ['renewal', 'intention', 'fire_ceremonies', 'purification'],
  },
}

export function getWheelNode(name) {
  return WHEEL_NODES[name] || null
}

export function getAllThresholdNames() {
  return Object.keys(WHEEL_NODES)
}
