// Lunar phase engine — calculates current moon phase from date
// Reference new moon: Jan 6, 2000 18:14 UTC (J2000 era)
// Synodic period: 29.53059 days

const SYNODIC = 29.53059
const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()

export function getLunarAge(date = new Date()) {
  const elapsed = date.getTime() - REF_NEW_MOON
  const days = elapsed / 86400000
  return ((days % SYNODIC) + SYNODIC) % SYNODIC
}

export function getLunarPhase(date = new Date()) {
  const age = getLunarAge(date)
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * age / SYNODIC)) / 2 * 100)

  let name, glyph, rhythm

  if (age < 1.85) {
    name = 'New Moon'; glyph = '🌑'
    rhythm = 'Seed intentions. Begin quietly. Inner work over external push.'
  } else if (age < 7.38) {
    name = 'Waxing Crescent'; glyph = '🌒'
    rhythm = 'Build momentum. Act on what you seeded. First steps matter.'
  } else if (age < 9.22) {
    name = 'First Quarter'; glyph = '🌓'
    rhythm = 'Decide and act. Tension is productive here — overcome inertia.'
  } else if (age < 14.77) {
    name = 'Waxing Gibbous'; glyph = '🌔'
    rhythm = 'Refine and adjust. You are close to full expression — don\'t abandon now.'
  } else if (age < 16.61) {
    name = 'Full Moon'; glyph = '🌕'
    rhythm = 'Peak clarity and visibility. What began at new moon is now revealed.'
  } else if (age < 22.15) {
    name = 'Waning Gibbous'; glyph = '🌖'
    rhythm = 'Share what you\'ve learned. The harvest is in — who benefits from it?'
  } else if (age < 23.99) {
    name = 'Last Quarter'; glyph = '🌗'
    rhythm = 'Let go of what no longer serves. Gratitude for what worked.'
  } else {
    name = 'Waning Crescent'; glyph = '🌘'
    rhythm = 'Rest and surrender. The cycle completes. Prepare the ground.'
  }

  return {
    name,
    glyph,
    illumination,
    age: Math.round(age * 10) / 10,
    rhythm,
    daysUntilNew: Math.round((SYNODIC - age) * 10) / 10,
  }
}
