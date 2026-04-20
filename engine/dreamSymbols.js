// Dream symbol extraction — Jungian archetypal keyword mapping

export const SYMBOL_MAP = [
  {
    symbol: 'Water',
    keywords: ['water', 'ocean', 'sea', 'river', 'lake', 'flood', 'rain', 'wave', 'swimming', 'drowning', 'stream', 'pool', 'tide'],
    meaning: 'Emotion, the unconscious, depth, flow',
  },
  {
    symbol: 'Fire',
    keywords: ['fire', 'flame', 'burning', 'torch', 'candle', 'smoke', 'ash', 'blaze', 'heat', 'ember'],
    meaning: 'Transformation, passion, destruction, purification',
  },
  {
    symbol: 'Shadow Figure',
    keywords: ['shadow', 'dark figure', 'stranger', 'chasing', 'chased', 'pursuing', 'threat', 'monster', 'demon', 'intruder'],
    meaning: 'The disowned self, unintegrated parts, unconscious pressure',
  },
  {
    symbol: 'House / Building',
    keywords: ['house', 'home', 'room', 'building', 'door', 'window', 'stairs', 'attic', 'basement', 'corridor', 'hallway', 'apartment'],
    meaning: 'The psyche, self, different aspects of inner life',
  },
  {
    symbol: 'Flying',
    keywords: ['flying', 'float', 'soaring', 'levitating', 'falling', 'wings', 'airborne', 'hovering', 'descent'],
    meaning: 'Freedom, transcendence, perspective shift, escape',
  },
  {
    symbol: 'Death / Rebirth',
    keywords: ['death', 'dying', 'dead', 'grave', 'funeral', 'corpse', 'rebirth', 'resurrection', 'killed', 'murder'],
    meaning: 'Transformation, endings, the psyche renewing itself',
  },
  {
    symbol: 'Child',
    keywords: ['child', 'baby', 'infant', 'young', 'childhood', 'playing', 'innocent', 'small', 'toddler'],
    meaning: 'The inner child, new beginnings, pure potential',
  },
  {
    symbol: 'Animal',
    keywords: ['animal', 'wolf', 'bear', 'snake', 'lion', 'bird', 'cat', 'dog', 'horse', 'spider', 'insect', 'creature', 'beast'],
    meaning: 'Instinct, the wild self, primal energies',
  },
  {
    symbol: 'Wise Figure',
    keywords: ['teacher', 'wise', 'elder', 'guide', 'mentor', 'guru', 'sage', 'prophet', 'priestess', 'wizard', 'healer'],
    meaning: 'Inner wisdom, guidance from depth, the higher self',
  },
  {
    symbol: 'Road / Journey',
    keywords: ['road', 'path', 'journey', 'walk', 'travel', 'direction', 'crossroads', 'lost', 'map', 'destination', 'highway', 'bridge'],
    meaning: 'Life direction, choices, the path ahead',
  },
  {
    symbol: 'Light',
    keywords: ['light', 'glow', 'bright', 'shining', 'sun', 'star', 'radiance', 'illumination', 'beam', 'glow', 'dawn'],
    meaning: 'Consciousness, clarity, the divine, insight',
  },
  {
    symbol: 'Teeth',
    keywords: ['teeth', 'tooth', 'falling out', 'crumbling', 'bite', 'jaw', 'mouth', 'dental'],
    meaning: 'Anxiety, power, communication, vulnerability',
  },
  {
    symbol: 'Gold / Treasure',
    keywords: ['gold', 'treasure', 'jewel', 'gem', 'diamond', 'wealth', 'buried', 'hidden', 'precious', 'crystal'],
    meaning: 'The Self, inner value, the soul\'s purpose',
  },
  {
    symbol: 'Moon',
    keywords: ['moon', 'moonlight', 'lunar', 'crescent', 'full moon', 'moonrise', 'moonset'],
    meaning: 'The unconscious, cyclical time, feminine principle, intuition',
  },
  {
    symbol: 'Snake',
    keywords: ['snake', 'serpent', 'viper', 'cobra', 'python', 'slithering'],
    meaning: 'Transformation, kundalini energy, healing, hidden knowledge',
  },
]

export function extractDreamSymbols(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = []
  for (const { symbol, keywords, meaning } of SYMBOL_MAP) {
    if (keywords.some(k => lower.includes(k))) {
      found.push({ symbol, meaning })
    }
  }
  return found
}

export function buildSymbolFrequency(dreamEntries = []) {
  const freq = {}
  for (const entry of dreamEntries) {
    if (!entry.symbols) continue
    for (const { symbol } of entry.symbols) {
      freq[symbol] = (freq[symbol] || 0) + 1
    }
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .map(([symbol, count]) => ({ symbol, count }))
}
