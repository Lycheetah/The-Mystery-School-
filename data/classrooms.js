// The Mystery School — Built-in Classrooms
// 10 curated learning paths through the 220-subject catalogue
// Each classroom is a sequence of subjects forming a coherent arc

export const CLASSROOMS = [
  // ─── THE FOUNDATION ────────────────────────────────────────────────
  // The core arc every student walks first. 24 subjects. No prerequisites
  // needed — this IS the prerequisite for everything else.
  {
    id: 'foundation',
    name: 'The Foundation',
    glyph: '⊚',
    tagline: 'Where all serious study begins.',
    description: 'The essential ground. Attention, body, shadow, and epistemology. These four pillars hold every other classroom. Complete this first.',
    colour: '#C8A96E', // gold
    subjects: [
      'shamatha',
      'somatic_awareness',
      'epistemology_foundations',
      'stoic_practice',
      'trauma_framework',
      'mantra_meditation',
      'breathwork_foundations',
      'nigredo_work',
      'attachment_theory',
      'shadow_integration',
      'altar_work',
      'seven_hermetic_principles',
      'grief_work',
      'dream_journaling',
      'impermanence',
      'personal_ritual',
      'body_scan',
      'box_breathing',
      'contemplative_inquiry',
      'open_awareness',
      'digital_sovereignty_tech',
      'ubuntu_philosophy',
      'maat_principles',
      'seventh_generation',
    ],
    difficulty: 'foundation',
    estimatedHours: 60,
  },

  // ─── THE SCIENTIST'S PATH ──────────────────────────────────────────
  // For the rigorous, the sceptical, the evidence-minded.
  // Evidence-gated. Every subject here has Π ≥ 1.5.
  {
    id: 'scientists_path',
    name: "The Scientist's Path",
    glyph: 'Π',
    tagline: 'No belief required. Evidence gated.',
    description: 'For those who need proof before commitment. Every subject here has a Π score ≥ 1.5 — replicated, evidence-gated, and grounded in measurable reality.',
    colour: '#5B8DB8', // blue
    subjects: [
      'shamatha',
      'breathwork_foundations',
      'somatic_awareness',
      'trauma_framework',
      'attachment_theory',
      'box_breathing',
      'wim_hof',
      'binaural_beats',
      'yoga_nidra',
      'tai_chi',
      'stoic_practice',
      'four_noble_truths',
      'epistemology_foundations',
      'seven_hermetic_principles',
      'digital_sovereignty_tech',
    ],
    difficulty: 'foundation',
    estimatedHours: 40,
  },

  // ─── THE MYSTIC'S PATH ─────────────────────────────────────────────
  // For those who already feel the depth and want to map it.
  {
    id: 'mystics_path',
    name: "The Mystic's Path",
    glyph: 'Ψ',
    tagline: 'The felt sense mapped and deepened.',
    description: 'For those who already sense the invisible architecture. This path takes the felt knowing and gives it language, structure, and rigour.',
    colour: '#9B6DC5', // violet
    subjects: [
      'shamatha',
      'seven_hermetic_principles',
      'nigredo_work',
      'alchemy_intro',
      'kabbalah_intro',
      'tree_of_life',
      'advaita_vedanta',
      'sufi_heart',
      'dhikr',
      'dark_night_soul',
      'meister_eckhart',
      'dzogchen',
      'open_awareness',
      'contemplative_inquiry',
      'ibn_arabi',
      'tao_te_ching',
      'wu_wei_practice',
      'hesychasm',
    ],
    difficulty: 'middle',
    estimatedHours: 55,
  },

  // ─── THE SHADOW PATH ──────────────────────────────────────────────
  // The most confronting path. For those ready to meet what they have fled.
  {
    id: 'shadow_path',
    name: 'The Shadow Path',
    glyph: '⊗',
    tagline: 'What you run from runs the show.',
    description: 'Every unmet shadow runs more of your behaviour than you do. This path names it, meets it, and reclaims the energy locked inside it.',
    colour: '#B05050', // deep red
    subjects: [
      'trauma_framework',
      'somatic_awareness',
      'nigredo_work',
      'shadow_integration',
      'grief_work',
      'inner_child',
      'attachment_theory',
      'projection_work',
      'somatic_trauma',
      'voice_dialogue',
      'active_imagination',
      'ifs_therapy',
      'calcination',
      'fermentation',
      'conjunction',
    ],
    difficulty: 'middle',
    estimatedHours: 50,
  },

  // ─── THE HEALER'S PATH ────────────────────────────────────────────
  // For those who hold space for others. You cannot give what you have not integrated.
  {
    id: 'healers_path',
    name: "The Healer's Path",
    glyph: 'Ωheal',
    tagline: 'You cannot give what you have not integrated.',
    description: 'For practitioners, therapists, teachers, parents. The prerequisite to serving others is the thorough examination of self. This path completes that work.',
    colour: '#4C9E6A', // green
    subjects: [
      'shamatha',
      'somatic_awareness',
      'trauma_framework',
      'metta',
      'loving_kindness_adv',
      'tonglen',
      'grief_work',
      'inner_child',
      'somatic_trauma',
      'attachment_theory',
      'chakra_system',
      'meridian_system',
      'breathwork_energy',
      'ubuntu_philosophy',
      'ancestor_veneration',
      'sangoma_healing',
    ],
    difficulty: 'middle',
    estimatedHours: 55,
  },

  // ─── THE BUILDER'S PATH ───────────────────────────────────────────
  // For those making things in the world. Creativity, sovereignty, output.
  {
    id: 'builders_path',
    name: "The Builder's Path",
    glyph: '∇↑',
    tagline: 'Build from the inside out.',
    description: 'For makers, founders, engineers, artists. Attention, clarity, creative energy, and the capacity to output without burning out.',
    colour: '#C8883A', // amber
    subjects: [
      'shamatha',
      'stoic_practice',
      'digital_sovereignty_tech',
      'habit_formation',
      'sleep_architecture',
      'financial_sovereignty',
      'breathwork_foundations',
      'box_breathing',
      'critical_thinking',
      'communication_mastery',
      'ai_literacy',
      'prompt_engineering_depth',
      'human_ai_collaboration',
      'epistemology_foundations',
      'lycheetah_framework',
    ],
    difficulty: 'foundation',
    estimatedHours: 40,
  },

  // ─── THE ARTIST'S PATH ────────────────────────────────────────────
  // Creativity as spiritual practice. Dissolving the censor. Making from depth.
  {
    id: 'artists_path',
    name: "The Artist's Path",
    glyph: '≋',
    tagline: 'Dissolve the censor. Make from depth.',
    description: 'For those who make things that matter. Creativity is not a technique — it is a state. This path builds the conditions for genuine creative emergence.',
    colour: '#C8A96E', // gold
    subjects: [
      'shamatha',
      'authentic_movement',
      'dream_journaling',
      'dream_incubation',
      'hypnagogia',
      'active_imagination',
      'shadow_integration',
      'mantra_meditation',
      'tibetan_bowls',
      'overtone_singing',
      'butoh',
      'bioenergetics',
    ],
    difficulty: 'middle',
    estimatedHours: 40,
  },

  // ─── THE PHILOSOPHER'S PATH ───────────────────────────────────────
  // For those who need to understand before they can trust.
  {
    id: 'philosophers_path',
    name: "The Philosopher's Path",
    glyph: '∴',
    tagline: 'The mind that questions everything learns to trust what remains.',
    description: 'For the rigorously curious. Philosophy not as academic exercise but as lived epistemics. What can you actually know, and how do you act from there?',
    colour: '#5B8DB8', // blue
    subjects: [
      'epistemology_foundations',
      'stoic_practice',
      'philosophy_of_mind',
      'phenomenology_practice',
      'integral_theory',
      'seven_hermetic_principles',
      'advaita_vedanta',
      'four_noble_truths',
      'tao_te_ching',
      'critical_thinking',
      'lycheetah_framework',
      'ubuntu_philosophy',
      'maat_principles',
      'gurdjieff',
    ],
    difficulty: 'middle',
    estimatedHours: 45,
  },

  // ─── THE PARENT'S PATH ────────────────────────────────────────────
  // The most demanding role. The least prepared-for.
  {
    id: 'parents_path',
    name: "The Parent's Path",
    glyph: '⟲',
    tagline: 'The most demanding role. The least prepared for.',
    description: 'Parenting as a spiritual practice. The child reflects everything you have not resolved. This path completes that work so the next generation does not inherit it.',
    colour: '#4C9E6A', // green
    subjects: [
      'attachment_theory',
      'inner_child',
      'somatic_awareness',
      'trauma_framework',
      'ubuntu_philosophy',
      'seventh_generation',
      'grief_work',
      'metta',
      'loving_kindness_adv',
      'parenting_as_practice',
    ],
    difficulty: 'foundation',
    estimatedHours: 30,
  },

  // ─── THE CRISIS PATH ──────────────────────────────────────────────
  // For when the ground has given way. Minimum viable stabilisation.
  // Short. Evidence-based. Immediately practical.
  {
    id: 'crisis_path',
    name: 'The Crisis Path',
    glyph: '⟟',
    tagline: 'When the ground has given way.',
    description: 'For acute destabilisation, grief, loss, or overwhelm. Short. Evidence-based. Immediately practical. The minimum viable path when everything else has fallen away.',
    colour: '#B05050', // deep red
    subjects: [
      'box_breathing',
      'somatic_awareness',
      'body_scan',
      'grief_work',
      'trauma_framework',
      'metta',
      'impermanence',
      'stoic_practice',
    ],
    difficulty: 'foundation',
    estimatedHours: 15,
    warning: 'If you are in crisis, please contact a mental health professional or crisis line first.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getClassroomById(id) {
  return CLASSROOMS.find(c => c.id === id) || null
}

export function getClassroomProgress(classroomId, completedSubjectIds = []) {
  const classroom = getClassroomById(classroomId)
  if (!classroom) return { completed: 0, total: 0, pct: 0 }
  const total = classroom.subjects.length
  const completed = classroom.subjects.filter(id => completedSubjectIds.includes(id)).length
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function getNextSubjectInClassroom(classroomId, completedSubjectIds = []) {
  const classroom = getClassroomById(classroomId)
  if (!classroom) return null
  return classroom.subjects.find(id => !completedSubjectIds.includes(id)) || null
}
