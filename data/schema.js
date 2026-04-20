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
  VOID_ROOM:        'ms:void_room',        // Whether Void Room is unlocked
  SOVEREIGN_TIER:   'ms:sovereign_tier',   // IAP status
  FREE_MESSAGES:    'ms:free_messages',    // Guide message count + ad credits
  TAROT_HISTORY:    'ms:tarot_history',    // Daily tarot draw history
  WEEKLY_PULSE:     'ms:weekly_pulse',     // Weekly assessment history
  AMBIENT_ENABLED:  'ms:ambient_enabled',  // Boolean — ambient drone on/off
  AMBIENT_VOLUME:   'ms:ambient_volume',   // Float 0-1 — ambient volume
  USER_CLASSROOMS:      'ms:user_classrooms',        // Array of user-created learning paths
  GUIDE_CONVERSATIONS:  'ms:guide_conversations',    // Array of saved Guide conversations
  COUNCIL_SESSIONS:     'ms:council_sessions',        // Array of saved Council sessions
  CUSTOM_BREATHWORK:    'ms:custom_breathwork',       // Array of user-created breathwork patterns
  SESSION_CEREMONY:     'ms:session_ceremony',        // { date } — last opening ceremony date
  DOOR_CROSSINGS:       'ms:door_crossings',          // Array of { fromDoor, toDoor, intention, crossedAt }
  AGE_MODE:             'ms:age_mode',                // 'child' | 'teen' | 'adult'
  PARENTAL_MODE:        'ms:parental_mode',           // boolean — restricts void room + strong shadow content
  LOCALE:               'ms:locale',                  // 'en' | 'es'
  MASTERY_STAGES:       'ms:mastery_stages',          // { [subjectSlug]: 0|1|2|3|4 }
  SUBJECT_NOTES:        'ms:subject_notes',           // { [subjectSlug]: string }
  REFLECT_QUESTIONS:    'ms:reflect_questions',       // { [subjectSlug]: string[] }
  FORGE_TODAY:          'ms:forge_today',             // { subjectA, subjectB, date, questionType }
  FORGE_ENTRIES:        'ms:forge_entries',           // Array of forge journal entries
  LAST_OPENED_SUBJECT:  'ms:last_opened_subject',     // { id, name, domain } — most recently opened subject
  GUIDE_MODE:           'ms:guide_mode',              // 'teacher' | 'witness' | 'challenger' | 'oracle'
  GUIDE_INSIGHTS:       'ms:guide_insights',          // Array of extracted conversation insights
  JOURNAL_PATTERNS:     'ms:journal_patterns',        // Array of { word, count, lastEntry }
  JOURNAL_GUIDE_ENABLED: 'ms:journal_guide_enabled',  // boolean — allow Guide to read journal (default true)
  // U-02 Rite of Return
  LAST_ACTIVE_DATE:     'ms:last_active_date',         // ISO date string — updated on every session
  RETURN_RITES:         'ms:return_rites',             // Array of { date, choiceMade, note }
  STREAK_PAUSE_DAYS:    'ms:streak_pause_days',        // Total days paused due to absence (not counted against streak)
  // U-01 Covenant
  COVENANT:             'ms:covenant',                 // { text, glyph, date }
  COVENANT_HISTORY:     'ms:covenant_history',         // Array of past covenants
  // U-15 Initiation Rites
  INITIATION_SIGILS:    'ms:initiation_sigils',        // { [classroomId]: { sigil, date } }
  INITIATED_CLASSROOMS: 'ms:initiated_classrooms',     // Array of classroom IDs
  // U-04 Living Cosmos
  SKY_ENABLED:          'ms:sky_enabled',              // boolean — sky affects app (default true)
  HEMISPHERE:           'ms:hemisphere',               // 'n' | 's' (default 'n')
  // U-08 Oracle Mode
  ORACLE_CASTINGS:      'ms:oracle_castings',          // Array of oracle casting records
  ORACLE_LAST_DATE:     'ms:oracle_last_date',         // ISO date string — last casting date
  // U-05 Wheel of the Year
  WHEEL_RECORD:         'ms:wheel_record',             // Array of { name, date, reflection, glyph }
  // U-14 Ceremony Arcs
  ACTIVE_CEREMONY:      'ms:active_ceremony',          // Current ceremony { arcId, arcLength, dayIndex, ... }
  THRESHOLD_REGISTRY:   'ms:threshold_registry',       // Array of completed ceremony records
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
  // subjectId → {
  //   status: 'started' | 'completed',
  //   startedAt, completedAt,
  //   practiceCount,
  //   notes,
  //   mastery: 0-4   (0=none, 1=aware, 2=reading, 3=practising, 4=integrated)
  //   masteryNote: string  (user's own words on where they are)
  // }
}

// Four-stage mastery progression — auto-tracked and manual
export const MASTERY_STAGES = {
  NONE:        0,
  ENCOUNTERED: 1,
  STUDIED:     2,
  PRACTICED:   3,
  INTEGRATED:  4,
}

// Mastery levels — display info per stage
export const MASTERY_LEVELS = [
  { level: 0, label: 'Not started',  glyph: '◌',  colour: '#60708A', piWeight: 0 },
  { level: 1, label: 'Encountered',  glyph: '○',  colour: '#7C9AB8', piWeight: 0.25 },
  { level: 2, label: 'Studied',      glyph: '◎',  colour: '#8B7ACC', piWeight: 0.5 },
  { level: 3, label: 'Practiced',    glyph: '●',  colour: '#C9A84C', piWeight: 0.75 },
  { level: 4, label: 'Integrated',   glyph: '⊕',  colour: '#6BAA80', piWeight: 1.0 },
]

// Slugify a subject name for use as a store key
export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
