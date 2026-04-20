// Sovereign Tier — one-time unlock for cosmetic + quality-of-life perks
// The school never paywalls knowledge. Sovereign perks are cosmetic + comfort.

export const SOVEREIGN_UNLOCK_CODE = 'SOVEREIGNTY-2026'

export function checkSovereignCode(code) {
  return code.trim().toUpperCase() === SOVEREIGN_UNLOCK_CODE
}

export const SOVEREIGN_PERKS = [
  {
    id: 'unlimited_guide',
    glyph: '∞',
    label: 'Unlimited Guide',
    desc: 'No daily message cap on Sol Guide conversations.',
  },
  {
    id: 'sovereign_themes',
    glyph: '◈',
    label: 'Sovereign Themes',
    desc: 'Two extra depth themes: Sol (pure gold) and Eclipse (absolute void).',
  },
  {
    id: 'personal_glyph',
    glyph: '⟁',
    label: 'Personal Glyph',
    desc: 'A custom symbol that marks your presence throughout the school.',
  },
]
