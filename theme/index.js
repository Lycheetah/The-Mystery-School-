export { DEPTHS, PHASE_COLOURS, TOKENS, GLYPHS } from './colours'
export { FONTS, TEXT_STYLES } from './typography'

// Default depth for new users — Nigredo (the beginning)
export const DEFAULT_DEPTH = 'NIGREDO'

// Get depth theme by name or depth number
export const getDepthTheme = (depth) => {
  if (typeof depth === 'number') {
    const map = { 1: 'NIGREDO', 2: 'ALBEDO', 3: 'CITRINITAS', 4: 'RUBEDO' }
    depth = map[depth] || 'NIGREDO'
  }
  const { DEPTHS } = require('./colours')
  return DEPTHS[depth] || DEPTHS.NIGREDO
}
