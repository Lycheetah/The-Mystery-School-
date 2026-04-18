// The Mystery School — Typography System
// System fonts only — no external font dependencies at launch

export const FONTS = {
  // Serif for ritual/wisdom text — system serif fallback
  ritual: {
    regular: 'Georgia',
    italic: 'Georgia',
  },
  // Monospace for glyphs and coordinates
  glyph: {
    regular: 'Courier New',
  },
  // System sans for UI
  ui: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
}

// Text style presets — combine with depth colour
export const TEXT_STYLES = {
  display: {
    fontFamily: FONTS.ritual.regular,
    fontSize: 42,
    letterSpacing: 2,
    lineHeight: 52,
  },
  heading: {
    fontFamily: FONTS.ritual.regular,
    fontSize: 24,
    letterSpacing: 1,
    lineHeight: 32,
  },
  subheading: {
    fontFamily: FONTS.ui.medium,
    fontSize: 17,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  body: {
    fontFamily: FONTS.ui.regular,
    fontSize: 15,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  caption: {
    fontFamily: FONTS.ui.regular,
    fontSize: 13,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  glyph: {
    fontFamily: FONTS.glyph.regular,
    fontSize: 20,
    letterSpacing: 0,
  },
  glyphLarge: {
    fontFamily: FONTS.glyph.regular,
    fontSize: 48,
    letterSpacing: 0,
  },
  label: {
    fontFamily: FONTS.ui.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  wisdom: {
    fontFamily: FONTS.ritual.italic,
    fontSize: 18,
    letterSpacing: 0.5,
    lineHeight: 28,
    fontStyle: 'italic',
  },
}
