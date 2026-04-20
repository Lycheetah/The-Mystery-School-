// Astronomical calculations — all local, no API required

// ─── Moon Phase ───────────────────────────────────────────────────────────────

// Known new moon reference: 2000-01-06 18:14 UTC
const KNOWN_NEW_MOON_JD = 2451550.1
const LUNAR_CYCLE = 29.530588853

function dateToJD(date) {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24
  const A = Math.floor((14 - m) / 12)
  const yr = y + 4800 - A
  const mo = m + 12 * A - 3
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4)
    - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045
}

export function getMoonPhase(date = new Date()) {
  const jd = dateToJD(date)
  const daysSince = (jd - KNOWN_NEW_MOON_JD) % LUNAR_CYCLE
  const phase = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
  const illumination = (1 - Math.cos((phase / LUNAR_CYCLE) * 2 * Math.PI)) / 2

  let name, glyph
  const p = phase / LUNAR_CYCLE
  if      (p < 0.0339) { name = 'New Moon';         glyph = '🌑' }
  else if (p < 0.25)   { name = 'Waxing Crescent';  glyph = '🌒' }
  else if (p < 0.2839) { name = 'First Quarter';    glyph = '🌓' }
  else if (p < 0.50)   { name = 'Waxing Gibbous';   glyph = '🌔' }
  else if (p < 0.5339) { name = 'Full Moon';        glyph = '🌕' }
  else if (p < 0.75)   { name = 'Waning Gibbous';   glyph = '🌖' }
  else if (p < 0.7839) { name = 'Last Quarter';     glyph = '🌗' }
  else                  { name = 'Waning Crescent';  glyph = '🌘' }

  const isNew  = p < 0.04 || p > 0.96
  const isFull = p > 0.46 && p < 0.54

  return { phase: p, illumination, name, glyph, isNew, isFull, dayInCycle: phase }
}

// ─── Sun Sign ─────────────────────────────────────────────────────────────────

const SUN_SIGNS = [
  { name: 'Capricorn',   glyph: '♑', start: [12, 22] },
  { name: 'Aquarius',    glyph: '♒', start: [1,  20] },
  { name: 'Pisces',      glyph: '♓', start: [2,  19] },
  { name: 'Aries',       glyph: '♈', start: [3,  21] },
  { name: 'Taurus',      glyph: '♉', start: [4,  20] },
  { name: 'Gemini',      glyph: '♊', start: [5,  21] },
  { name: 'Cancer',      glyph: '♋', start: [6,  21] },
  { name: 'Leo',         glyph: '♌', start: [7,  23] },
  { name: 'Virgo',       glyph: '♍', start: [8,  23] },
  { name: 'Libra',       glyph: '♎', start: [9,  23] },
  { name: 'Scorpio',     glyph: '♏', start: [10, 23] },
  { name: 'Sagittarius', glyph: '♐', start: [11, 22] },
]

export function getSunSign(date = new Date()) {
  const m = date.getMonth() + 1
  const d = date.getDate()
  for (let i = SUN_SIGNS.length - 1; i >= 0; i--) {
    const [sm, sd] = SUN_SIGNS[i].start
    if (m > sm || (m === sm && d >= sd)) return SUN_SIGNS[i]
  }
  return SUN_SIGNS[0] // Capricorn tail (Dec)
}

// ─── Moon Sign (simplified — 2.5 days per sign) ──────────────────────────────

const MOON_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]
const MOON_SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

// Moon position relative to known reference: ~Jan 6 2000 new moon in Capricorn
const MOON_SIGN_REF_JD = 2451550.1
const MOON_SIGN_REF_IDX = 9 // Capricorn

export function getMoonSign(date = new Date()) {
  const jd = dateToJD(date)
  const days = jd - MOON_SIGN_REF_JD
  const sidereal = 27.321661
  const dayInCycle = ((days % sidereal) + sidereal) % sidereal
  const idx = (MOON_SIGN_REF_IDX + Math.floor(dayInCycle / (sidereal / 12))) % 12
  return { name: MOON_SIGNS[idx], glyph: MOON_SIGN_GLYPHS[idx] }
}

// ─── Mercury Retrograde (hardcoded periods 2024-2027) ────────────────────────
// More reliable than computing from scratch

const RETROGRADE_PERIODS = {
  Mercury: [
    { start: '2024-04-01', end: '2024-04-25', label: 'Aries → Pisces' },
    { start: '2024-08-05', end: '2024-08-28', label: 'Virgo → Leo' },
    { start: '2024-11-25', end: '2024-12-15', label: 'Sagittarius' },
    { start: '2025-03-15', end: '2025-04-07', label: 'Aries → Pisces' },
    { start: '2025-07-18', end: '2025-08-11', label: 'Leo' },
    { start: '2025-11-09', end: '2025-11-29', label: 'Sagittarius → Scorpio' },
    { start: '2026-03-01', end: '2026-03-22', label: 'Pisces → Aquarius' },
    { start: '2026-07-01', end: '2026-07-25', label: 'Leo → Cancer' },
    { start: '2026-10-25', end: '2026-11-14', label: 'Scorpio → Libra' },
    { start: '2027-02-13', end: '2027-03-05', label: 'Pisces' },
    { start: '2027-06-13', end: '2027-07-07', label: 'Cancer → Gemini' },
    { start: '2027-10-07', end: '2027-10-27', label: 'Scorpio → Libra' },
  ],
  Venus: [
    { start: '2025-03-01', end: '2025-04-12', label: 'Aries' },
    { start: '2026-07-23', end: '2026-09-03', label: 'Leo → Virgo' },
  ],
  Mars: [
    { start: '2024-12-06', end: '2025-02-23', label: 'Leo → Cancer' },
    { start: '2027-01-01', end: '2027-03-10', label: 'Virgo → Leo' },
  ],
  Saturn: [
    { start: '2025-07-12', end: '2025-11-27', label: 'Aries → Pisces' },
    { start: '2026-07-24', end: '2026-12-06', label: 'Taurus → Aries' },
  ],
  Jupiter: [
    { start: '2024-10-09', end: '2025-02-04', label: 'Gemini → Taurus' },
    { start: '2025-11-11', end: '2026-03-10', label: 'Cancer → Gemini' },
  ],
}

export function getActiveRetrogrades(date = new Date()) {
  const iso = date.toISOString().slice(0, 10)
  const active = []
  for (const [planet, periods] of Object.entries(RETROGRADE_PERIODS)) {
    for (const p of periods) {
      if (iso >= p.start && iso <= p.end) {
        active.push({ planet, label: p.label, start: p.start, end: p.end })
      }
    }
  }
  return active
}

export function getMercuryRetrograde(date = new Date()) {
  const iso = date.toISOString().slice(0, 10)
  for (const p of RETROGRADE_PERIODS.Mercury) {
    if (iso >= p.start && iso <= p.end) {
      return { active: true, label: p.label, end: p.end }
    }
  }
  // Find next
  const next = RETROGRADE_PERIODS.Mercury.find(p => p.start > iso)
  return { active: false, next: next?.start || null }
}

// ─── Seasonal Thresholds ──────────────────────────────────────────────────────
// Approximate solstice/equinox dates (±1 day)

function getSeasonalThresholds(year) {
  const nh = [
    { name: 'Spring Equinox',  date: `${year}-03-20`, glyph: '♈', energy: 'emergence' },
    { name: 'Beltane',         date: `${year}-05-01`, glyph: '✿', energy: 'vitality' },
    { name: 'Summer Solstice', date: `${year}-06-21`, glyph: '☀', energy: 'expansion' },
    { name: 'Lughnasadh',      date: `${year}-08-01`, glyph: '⊕', energy: 'harvest' },
    { name: 'Autumn Equinox',  date: `${year}-09-22`, glyph: '⚖', energy: 'balance' },
    { name: 'Samhain',         date: `${year}-11-01`, glyph: '◯', energy: 'descent' },
    { name: 'Winter Solstice', date: `${year}-12-21`, glyph: '❄', energy: 'stillness' },
    { name: 'Imbolc',          date: `${year + 1}-02-01`, glyph: '∗', energy: 'quickening' },
  ]
  const sh = [
    { name: 'Autumn Equinox',  date: `${year}-03-20`, glyph: '⚖', energy: 'balance' },
    { name: 'Samhain',         date: `${year}-05-01`, glyph: '◯', energy: 'descent' },
    { name: 'Winter Solstice', date: `${year}-06-21`, glyph: '❄', energy: 'stillness' },
    { name: 'Imbolc',          date: `${year}-08-01`, glyph: '∗', energy: 'quickening' },
    { name: 'Spring Equinox',  date: `${year}-09-22`, glyph: '♈', energy: 'emergence' },
    { name: 'Beltane',         date: `${year}-11-01`, glyph: '✿', energy: 'vitality' },
    { name: 'Summer Solstice', date: `${year}-12-21`, glyph: '☀', energy: 'expansion' },
    { name: 'Lughnasadh',      date: `${year + 1}-02-01`, glyph: '⊕', energy: 'harvest' },
  ]
  return { nh, sh }
}

export function getNearestThreshold(date = new Date(), hemisphere = 'n') {
  const year = date.getUTCFullYear()
  const iso = date.toISOString().slice(0, 10)
  const { nh, sh } = getSeasonalThresholds(year)
  const list = hemisphere === 's' ? sh : nh

  let nearest = null
  let minDiff = Infinity

  for (const t of list) {
    const diff = Math.abs(new Date(t.date) - date) / (1000 * 60 * 60 * 24)
    if (diff < minDiff) {
      minDiff = diff
      nearest = { ...t, daysAway: Math.round(diff) }
    }
  }

  return nearest
}

export function getUpcomingThresholds(date = new Date(), hemisphere = 'n', count = 3) {
  const year = date.getUTCFullYear()
  const iso = date.toISOString().slice(0, 10)
  const { nh, sh } = getSeasonalThresholds(year)
  const list = hemisphere === 's' ? sh : nh
  return list
    .filter(t => t.date >= iso)
    .slice(0, count)
    .map(t => ({
      ...t,
      daysAway: Math.round((new Date(t.date) - date) / (1000 * 60 * 60 * 24))
    }))
}

// ─── Full cosmos snapshot ─────────────────────────────────────────────────────

export function getCosmosSnapshot(date = new Date(), hemisphere = 'n') {
  const moon = getMoonPhase(date)
  const sunSign = getSunSign(date)
  const moonSign = getMoonSign(date)
  const retrogrades = getActiveRetrogrades(date)
  const mercuryRx = getMercuryRetrograde(date)
  const nearestThreshold = getNearestThreshold(date, hemisphere)
  const upcomingThresholds = getUpcomingThresholds(date, hemisphere, 3)

  // Moon tint: new=dark blue, waxing=silver, full=gold, waning=amber
  let moonTint = null
  const p = moon.phase
  if (p < 0.1 || p > 0.9)   moonTint = 'rgba(40, 40, 80, 0.06)'
  else if (p < 0.5)          moonTint = 'rgba(180, 180, 210, 0.04)'
  else if (p < 0.6)          moonTint = 'rgba(201, 168, 76, 0.07)'
  else                        moonTint = 'rgba(180, 140, 60, 0.04)'

  return {
    moon,
    sunSign,
    moonSign,
    retrogrades,
    mercuryRx,
    nearestThreshold,
    upcomingThresholds,
    moonTint,
  }
}
