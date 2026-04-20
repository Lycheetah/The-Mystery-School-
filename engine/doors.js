// The Ten Doors — Archetypal Entry Points
// Each door shapes language, ordering, wisdom tone, and emphasis
// All doors lead to the same truth. The door is the context, not the destination.

export const DOORS = {
  SEEKER: {
    key: 'SEEKER',
    name: 'The Seeker',
    glyph: '⟟',
    hook: 'Something is missing. You\'re looking.',
    opening: 'You have always been looking. Now the school is looking back.',
    tone: 'honest',
    emphasises: ['questions', 'not knowing', 'beginning'],
    subjectOrder: 'curiosity_first',
    wisdomStyle: 'direct',
  },
  BUILDER: {
    key: 'BUILDER',
    name: 'The Builder',
    glyph: 'Φ↑',
    hook: 'You want to construct something real.',
    opening: 'What you are building has a foundation you haven\'t seen yet. Let\'s find it.',
    tone: 'grounded',
    emphasises: ['systems', 'foundations', 'application'],
    subjectOrder: 'foundations_first',
    wisdomStyle: 'pragmatic',
  },
  WOUNDED: {
    key: 'WOUNDED',
    name: 'The Wounded',
    glyph: 'Ωheal',
    hook: 'Something broke. You\'re still here.',
    opening: 'The fact that you are here is proof you have already survived. Now we begin the next part.',
    tone: 'holding',
    emphasises: ['healing', 'shadow', 'grief', 'return'],
    subjectOrder: 'healing_first',
    wisdomStyle: 'gentle',
  },
  SCIENTIST: {
    key: 'SCIENTIST',
    name: 'The Scientist',
    glyph: '∇cas',
    hook: 'You need evidence. That\'s valid.',
    opening: 'Every claim in this school has a falsification condition. You are in the right place.',
    tone: 'precise',
    emphasises: ['evidence', 'falsifiability', 'mechanisms'],
    subjectOrder: 'mechanisms_first',
    wisdomStyle: 'empirical',
  },
  MYSTIC: {
    key: 'MYSTIC',
    name: 'The Mystic',
    glyph: 'Ψ',
    hook: 'You\'ve felt something that can\'t be named.',
    opening: 'The unnamed thing has a name. Several names. We\'ll find the one that fits yours.',
    tone: 'spacious',
    emphasises: ['consciousness', 'non-ordinary', 'integration'],
    subjectOrder: 'depth_first',
    wisdomStyle: 'poetic',
  },
  REBEL: {
    key: 'REBEL',
    name: 'The Rebel',
    glyph: '⊗',
    hook: 'The system failed you. You know it.',
    opening: 'The system failed many people. The school you\'re entering is the one they didn\'t want you to find.',
    tone: 'direct',
    emphasises: ['autonomy', 'gatekeeping', 'reclamation'],
    subjectOrder: 'gatekeeping_first',
    wisdomStyle: 'sharp',
  },
  ARTIST: {
    key: 'ARTIST',
    name: 'The Artist',
    glyph: '≋',
    hook: 'You feel more than you can say.',
    opening: 'The work you make is already a message from the part of you that knows. We\'re decoding it together.',
    tone: 'sensory',
    emphasises: ['creativity', 'transmission', 'expression'],
    subjectOrder: 'creativity_first',
    wisdomStyle: 'imagistic',
  },
  PARENT: {
    key: 'PARENT',
    name: 'The Parent',
    glyph: 'Ao',
    hook: 'You carry others. Who carries you?',
    opening: 'The work you do here will reach further than you can see. The people in your care feel the quality of your inner life.',
    tone: 'warm',
    emphasises: ['relationships', 'transmission', 'modeling'],
    subjectOrder: 'relational_first',
    wisdomStyle: 'personal',
  },
  ELDER: {
    key: 'ELDER',
    name: 'The Elder',
    glyph: '|◁▷|',
    hook: 'You have seen enough. You want to understand it.',
    opening: 'You don\'t need more information. You need a framework that makes sense of what you\'ve already lived.',
    tone: 'reflective',
    emphasises: ['integration', 'meaning', 'completion'],
    subjectOrder: 'integration_first',
    wisdomStyle: 'contemplative',
  },
  STUDENT: {
    key: 'STUDENT',
    name: 'The Student',
    glyph: '✧',
    hook: 'School failed you. This one won\'t.',
    opening: 'What you weren\'t taught is the most important curriculum. You\'re about to receive it.',
    tone: 'encouraging',
    emphasises: ['foundations', 'gatekept knowledge', 'sequence'],
    subjectOrder: 'remedial_first',
    wisdomStyle: 'clear',
  },
}

// Domain priority ordering per door
// Maps subjectOrder label → ordered domain list (first = highest priority)
// Unlisted domains appear after the prioritised ones in alphabetical order
export const DOOR_DOMAIN_ORDER = {
  curiosity_first: [
    'Philosophy & Epistemology',
    'Meditation & Contemplative Arts',
    'Alchemy & Transformation',
    'Buddhist Deep Practice',
    'Dream Work',
    'Divination & Symbolic Systems',
    'Sacred Geometry & Mathematics',
    'Taoism & Chinese Wisdom',
  ],
  foundations_first: [
    'Philosophy & Epistemology',
    'Breathwork & Pranayama',
    'Meditation & Contemplative Arts',
    'Movement & Somatic',
    'Practical Sovereignty',
    'AI & Technology',
    'Shadow Work & Psychology',
    'Alchemy & Transformation',
  ],
  healing_first: [
    'Shadow Work & Psychology',
    'Death Work & Grief',
    'Movement & Somatic',
    'Breathwork & Pranayama',
    'Energy Healing',
    'Meditation & Contemplative Arts',
    'African Spiritual Traditions',
    'Indigenous Knowledge Systems',
  ],
  mechanisms_first: [
    'Philosophy & Epistemology',
    'Breathwork & Pranayama',
    'Meditation & Contemplative Arts',
    'Movement & Somatic',
    'AI & Technology',
    'Sound, Vibration & Cymatics',
    'Sacred Geometry & Mathematics',
    'The Dismissed Pioneers',
  ],
  depth_first: [
    'Meditation & Contemplative Arts',
    'Alchemy & Transformation',
    'Kabbalah & Tree of Life',
    'Sufism & Islamic Mysticism',
    'Buddhist Deep Practice',
    'Hindu Philosophy & Yoga',
    'Christian Mysticism',
    'Taoism & Chinese Wisdom',
  ],
  gatekeeping_first: [
    'The Dismissed Pioneers',
    'Indigenous Knowledge Systems',
    'African Spiritual Traditions',
    'Shadow Work & Psychology',
    'Plant Medicine',
    'Alchemy & Transformation',
    'Practical Sovereignty',
    'Philosophy & Epistemology',
  ],
  creativity_first: [
    'Dream Work',
    'Movement & Somatic',
    'Sound, Vibration & Cymatics',
    'Ritual Arts',
    'Alchemy & Transformation',
    'Shamanic Arts',
    'Sacred Geometry & Mathematics',
    'Divination & Symbolic Systems',
  ],
  relational_first: [
    'African Spiritual Traditions',
    'Indigenous Knowledge Systems',
    'Shadow Work & Psychology',
    'Sacred Sexuality',
    'Death Work & Grief',
    'Energy Healing',
    'Meditation & Contemplative Arts',
    'Buddhist Deep Practice',
  ],
  integration_first: [
    'Alchemy & Transformation',
    'Philosophy & Epistemology',
    'Death Work & Grief',
    'Buddhist Deep Practice',
    'Taoism & Chinese Wisdom',
    'Shadow Work & Psychology',
    'Meditation & Contemplative Arts',
    'Kabbalah & Tree of Life',
  ],
  remedial_first: [
    'Meditation & Contemplative Arts',
    'Breathwork & Pranayama',
    'Philosophy & Epistemology',
    'Shadow Work & Psychology',
    'Movement & Somatic',
    'Practical Sovereignty',
    'Alchemy & Transformation',
    'Buddhist Deep Practice',
  ],
}

// Sort domain names according to the user's door priority
// Unranked domains appear after prioritised ones, alphabetically
export function sortDomainsByDoor(domains, doorKey) {
  const door = DOORS[doorKey]
  if (!door) return domains
  const order = DOOR_DOMAIN_ORDER[door.subjectOrder] || []
  const ranked = order.filter(d => domains.includes(d))
  const unranked = domains.filter(d => !order.includes(d)).sort()
  return [...ranked, ...unranked]
}

// Get the prioritised domains for a door (top 3 for label display)
export function getDoorPriorityDomains(doorKey, count = 3) {
  const door = DOORS[doorKey]
  if (!door) return []
  return (DOOR_DOMAIN_ORDER[door.subjectOrder] || []).slice(0, count)
}

// Get language modifier for a given door
export function getDoorLanguage(doorKey) {
  return DOORS[doorKey] || DOORS.SEEKER
}

// Get door-specific greeting for wisdom cards
export function getDoorGreeting(doorKey) {
  const door = DOORS[doorKey] || DOORS.SEEKER
  const greetings = {
    SEEKER:    'You are still looking. Good.',
    BUILDER:   'The foundation holds.',
    WOUNDED:   'You made it through another day.',
    SCIENTIST: 'The data is consistent.',
    MYSTIC:    'The field is awake.',
    REBEL:     'You\'re still here. They didn\'t expect that.',
    ARTIST:    'The work is listening.',
    PARENT:    'You are carrying something important.',
    ELDER:     'Another thread understood.',
    STUDENT:   'You learned something real today.',
  }
  return greetings[doorKey] || greetings.SEEKER
}
