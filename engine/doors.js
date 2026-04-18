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
