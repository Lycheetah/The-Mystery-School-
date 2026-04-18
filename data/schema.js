// The Mystery School — AsyncStorage Data Schema
// All data lives on device. No server. No account required.

// Storage keys
export const KEYS = {
  // User state
  USER_STATE:       'ms:user_state',       // Phase, depth, door, onboarded
  ASSESSMENT:       'ms:assessment',       // Last WHERE_AM_I result
  PROGRESS:         'ms:progress',         // Subject completion map
  PRACTICE_LOG:     'ms:practice_log',     // Array of practice sessions
  JOURNAL:          'ms:journal',          // Array of journal entries
  STREAKS:          'ms:streaks',          // Practice streak data
  WISDOM_SEEN:      'ms:wisdom_seen',      // Set of seen wisdom IDs
  WISDOM_TODAY:     'ms:wisdom_today',     // Today's wisdom (date + id)
  UNLOCKED_ROOM:    'ms:unlocked_room',    // Whether Uncommon Room is unlocked
  SOVEREIGN_TIER:   'ms:sovereign_tier',   // IAP status
  FREE_MESSAGES:    'ms:free_messages',    // Guide message count + ad credits
  TAROT_HISTORY:    'ms:tarot_history',    // Daily tarot draw history
  WEEKLY_PULSE:     'ms:weekly_pulse',     // Weekly assessment history
}

// User state shape
export const DEFAULT_USER_STATE = {
  onboarded: false,
  phase: null,            // 1-7
  depth: null,            // 1-4 (Nigredo/Albedo/Citrinitas/Rubedo)
  door: null,             // door key e.g. 'SEEKER'
  depthKey: 'NIGREDO',    // theme key
  assessedAt: null,       // ISO date string
  coordinates: null,      // { phase, depth, phaseName, depthName, glyph }
}

// Subject progress entry shape
export const DEFAULT_SUBJECT_PROGRESS = {
  // subjectId → { status, startedAt, completedAt, practiceCount, notes }
}

// Practice session shape
export const PRACTICE_SESSION = {
  id: '',             // uuid
  subjectId: '',      // which subject
  type: '',           // 'breathwork' | 'meditation' | 'shadow_work' | 'study'
  duration: 0,        // seconds
  completedAt: '',    // ISO date
  phase: 1,           // phase at time of practice
  depth: 1,           // depth at time of practice
  notes: '',          // optional
}

// Journal entry shape
export const JOURNAL_ENTRY = {
  id: '',             // uuid
  type: '',           // 'phase_prompt' | 'dream' | 'insight' | 'shadow' | 'free'
  prompt: '',         // the prompt shown
  content: '',        // user's text
  phase: 1,
  depth: 1,
  createdAt: '',      // ISO date
  tags: [],           // user tags
}

// Streak data shape
export const DEFAULT_STREAKS = {
  current: 0,         // days in a row
  longest: 0,
  lastPracticeDate: null,
  totalSessions: 0,
  totalMinutes: 0,
}

// Free message tier shape
export const DEFAULT_FREE_MESSAGES = {
  count: 10,          // remaining today
  adCredits: 0,       // messages earned via ads
  lastResetDate: null,// date of last daily reset
  totalEarned: 0,     // lifetime ad credits
}
