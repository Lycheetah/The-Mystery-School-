// The Mystery School — Colour System
// Four depths × seven phases + structural tokens

export const DEPTHS = {
  NIGREDO: {
    name: 'Nigredo',
    symbol: '⚫',
    // Deep transformation — ash, coal, the void before form
    bg: '#0A0A12',
    surface: '#12121E',
    card: '#1A1A2E',
    border: '#2A2A40',
    accent: '#6B4FA0',      // deep violet
    accentSoft: '#3D2E5C',
    text: '#C8C4D4',
    textDim: '#7A7590',
    textBright: '#E8E4F4',
    glyph: '#8B6CC4',
    flame: '#4A3070',
  },
  ALBEDO: {
    name: 'Albedo',
    symbol: '⬜',
    // Moderate transformation — silver, ash-white, purified
    bg: '#0D1018',
    surface: '#141820',
    card: '#1C2230',
    border: '#2C3448',
    accent: '#7CB5C4',      // cool silver-blue
    accentSoft: '#2C4A56',
    text: '#C4D0DC',
    textDim: '#6A8090',
    textBright: '#E4F0F8',
    glyph: '#8EC8D8',
    flame: '#2A5060',
  },
  CITRINITAS: {
    name: 'Citrinitas',
    symbol: '🟡',
    // Light transformation — amber, dawn gold, awakening
    bg: '#0E0C08',
    surface: '#181408',
    card: '#221C0C',
    border: '#3A3010',
    accent: '#C9A84C',      // amber gold
    accentSoft: '#5C4818',
    text: '#D4C89C',
    textDim: '#8A7A50',
    textBright: '#F0E4B8',
    glyph: '#D8B860',
    flame: '#704C10',
  },
  RUBEDO: {
    name: 'Rubedo',
    symbol: '🔴',
    // Integration — deep crimson, the stone, completion
    bg: '#100808',
    surface: '#1C0C0C',
    card: '#281414',
    border: '#401C1C',
    accent: '#C44848',      // sovereign red
    accentSoft: '#581818',
    text: '#D4B4B4',
    textDim: '#8A6060',
    textBright: '#F0D0D0',
    glyph: '#D86060',
    flame: '#7C2020',
  },
  SOL: {
    name: 'Sol',
    symbol: '☀',
    sovereign: true,
    // Sovereign — pure solar gold, the alchemical sun
    bg: '#0C0A02',
    surface: '#181204',
    card: '#241C06',
    border: '#40300A',
    accent: '#E8C040',      // bright gold
    accentSoft: '#6C4C08',
    text: '#E0D4A0',
    textDim: '#9A8840',
    textBright: '#FFF0B8',
    glyph: '#F0D050',
    flame: '#905C08',
  },
  ECLIPSE: {
    name: 'Eclipse',
    symbol: '☽',
    sovereign: true,
    // Sovereign — absolute void, electric violet
    bg: '#040408',
    surface: '#08080F',
    card: '#0E0E1C',
    border: '#1A1A30',
    accent: '#9060D8',      // electric violet
    accentSoft: '#2C1860',
    text: '#B8B0D0',
    textDim: '#60587A',
    textBright: '#E0D8F8',
    glyph: '#A870F0',
    flame: '#3C1880',
  },
}

// Phase accent colours — used regardless of depth
export const PHASE_COLOURS = {
  1: { name: 'CENTER',  colour: '#8888CC', glyph: '⟟' },
  2: { name: 'FLOW',    colour: '#88B8CC', glyph: '≋' },
  3: { name: 'INSIGHT', colour: '#88CCAA', glyph: 'Ψ' },
  4: { name: 'ASCENT',  colour: '#C9A84C', glyph: 'Φ↑' },
  5: { name: 'CLARITY', colour: '#CCC888', glyph: '✧' },
  6: { name: 'WITNESS', colour: '#CC9870', glyph: '|◁▷|' },
  7: { name: 'RETURN',  colour: '#CC7888', glyph: '⟲' },
}

// Structural tokens — depth-agnostic
export const TOKENS = {
  // Typography scale
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 42,
  },
  // Spacing scale
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
  },
  // Border radius
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 32,
    full: 9999,
  },
  // Animation durations
  duration: {
    fast: 180,
    base: 320,
    slow: 600,
    breath: 4000,
  },
}

// LAMAGUE glyph vocabulary
export const GLYPHS = {
  phi:      'Φ↑',    // Ascent / golden ratio / elevation
  cas:      '∇cas',  // CASCADE / downward pattern / synthesis
  psi:      'Ψ',     // Insight / mind / branching
  ao:       'Ao',    // Harmonia / resonance / accord
  heal:     'Ωheal', // Healing / completion / wholeness
  cross:    '⊗',     // Tension / paradox / intersection
  void:     '∅',     // Void / negation / dissolution
  center:   '⟟',     // Center / grounding / anchor
  flow:     '≋',     // Flow / water / movement
  witness:  '|◁▷|',  // Witness / observation / mirror
  return:   '⟲',     // Return / cycle / completion
  clarity:  '✧',     // Clarity / star / emergence
  pi:       'Π',     // Framework truth score
  lambda:   'λ',     // Convergence
  delta:    'Δ',     // Change / transformation
  sigma:    'Σ',     // Sum / integration
}
