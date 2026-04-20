// Local journal pattern detection — no AI, pure word frequency

const DEFAULT_STOPWORDS = new Set([
  'the','and','that','this','with','for','are','was','were','have','has',
  'had','been','will','would','could','should','can','may','might','shall',
  'from','into','onto','over','under','after','before','about','above',
  'when','then','than','what','which','there','their','they','these','those',
  'them','some','more','also','just','very','much','many','most','such',
  'like','even','still','back','your','our','its','his','her','him','she',
  'but','not','all','any','one','two','how','who','why','did','does','got',
  'get','let','put','use','made','make','take','took','come','came','went',
  'going','been','being','want','feel','felt','know','knew','think','thought',
  'see','saw','say','said','tell','told','keep','kept','find','found',
  'look','looks','looking','need','needs','needed','seem','seems','seemed',
  'really','always','never','often','sometimes','every','each','only','too',
  'now','day','days','time','times','way','ways','life','good','new','old',
  'same','different','little','big','great','long','high','own','right',
  'well','able','both','here','so','an','a','i','me','my','we','us','you',
  'it','be','do','to','of','in','on','at','by','as','or','if','no','is',
  'up','out','off','down','he','she','they','we','who',
])

/**
 * Extract recurring words from journal entries over the last N days
 * Returns [{word, count, lastSeen}] sorted by count desc
 */
export function extractPatterns(entries = [], { minCount = 3, days = 30, stopwords = DEFAULT_STOPWORDS } = {}) {
  const cutoff = Date.now() - days * 86400000
  const recent = entries.filter(e => new Date(e.createdAt).getTime() > cutoff)
  if (recent.length === 0) return []

  const freq = new Map()      // word → count
  const lastSeen = new Map()  // word → most recent entry createdAt

  for (const entry of recent) {
    const text = (entry.content || '') + ' ' + (entry.prompt || '')
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && w.length <= 20 && !stopwords.has(w) && !/^\d+$/.test(w))

    const seen = new Set()
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1)
      // Track most recent entry per word (entries sorted desc already)
      if (!lastSeen.has(word) || entry.createdAt > lastSeen.get(word)) {
        lastSeen.set(word, entry.createdAt)
      }
      seen.add(word)
    }
  }

  return Array.from(freq.entries())
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count, lastSeen: lastSeen.get(word) }))
}

/**
 * Find most recent journal entry containing a word
 */
export function findEntryForWord(entries = [], word) {
  const lower = word.toLowerCase()
  return entries.find(e =>
    (e.content || '').toLowerCase().includes(lower) ||
    (e.prompt || '').toLowerCase().includes(lower)
  ) || null
}
