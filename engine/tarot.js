// The Daily Tarot Draw — Major Arcana Engine
// 22 cards mapped to the 7 phases with phase-aware interpretations
// One card per day, stable across restarts. History tracked in TAROT_HISTORY.
//
// Rendering is text-only. No images — glyphs and typography carry it.

export const MAJOR_ARCANA = [
  {
    number: 0,
    name: 'The Fool',
    glyph: '○',
    phase: 1,
    keyword: 'Beginnings',
    upright: 'The nothing before the something. Pure potential. The step off the edge before the path appears beneath your feet. You do not need to know where you are going — you need to go.',
    shadow: 'Naivety as avoidance. Refusing to take stock. The Fool who never grows is not free — they are stuck.',
    question: 'What would you begin if you did not need to know how it ends?',
  },
  {
    number: 1,
    name: 'The Magician',
    glyph: '⊕',
    phase: 2,
    keyword: 'Willpower',
    upright: 'All four elements on the table. The capacity to direct will through the material world. You have everything you need. The question is whether you know that.',
    shadow: 'Manipulation. Using skill without ethics. Power directed away from service.',
    question: 'What are you capable of that you have not yet attempted?',
  },
  {
    number: 2,
    name: 'The High Priestess',
    glyph: '☽',
    phase: 3,
    keyword: 'Intuition',
    upright: 'The veil between known and unknown. The wisdom that does not announce itself. What arrives in the space between thoughts is not imagination — it is information.',
    shadow: 'Withdrawal into interiority. Passivity disguised as depth. Mystery as distance.',
    question: 'What do you know that you have been unwilling to act on?',
  },
  {
    number: 3,
    name: 'The Empress',
    glyph: 'Ωheal',
    phase: 5,
    keyword: 'Abundance',
    upright: 'The creative force of nature. Fertility in the broadest sense — ideas, relationships, growth, beauty. What you tend with care will grow.',
    shadow: 'Smothering. Over-giving as control. Creating dependency rather than nourishment.',
    question: 'What are you nourishing right now? Is it what you intend to grow?',
  },
  {
    number: 4,
    name: 'The Emperor',
    glyph: '⊞',
    phase: 4,
    keyword: 'Structure',
    upright: 'The necessary container. Order that makes freedom possible. Authority taken responsibly. The structure that holds the chaos so that something can be built.',
    shadow: 'Rigidity. Control that stifles rather than enables. Authority without wisdom.',
    question: 'Where does your life need more structure? Where does it need less?',
  },
  {
    number: 5,
    name: 'The Hierophant',
    glyph: '∑',
    phase: 5,
    keyword: 'Tradition',
    upright: 'The transmission of accumulated wisdom. The teacher who carries what has been tested across generations. Not all tradition is dead — some of it is alive and waiting to be received.',
    shadow: 'Dogma. Institutional capture. The letter of the law without its spirit.',
    question: 'What tradition or lineage are you inheriting, consciously or not?',
  },
  {
    number: 6,
    name: 'The Lovers',
    glyph: '↔',
    phase: 5,
    keyword: 'Union',
    upright: 'The sacred meeting. Not only romantic union — the marriage of opposites within. The alchemical coniunctio. When two apparently separate things recognise each other as one.',
    shadow: 'Avoidance of choice. Remaining in false harmony. The union that bypasses real difference.',
    question: 'What needs to be joined in you that you have been keeping separate?',
  },
  {
    number: 7,
    name: 'The Chariot',
    glyph: 'Φ↑',
    phase: 4,
    keyword: 'Mastery',
    upright: 'Will directed. Opposites harnessed, not resolved. Victory that comes from holding tension while continuing to move. You do not need to have it all figured out — you need to hold the reins.',
    shadow: 'Force without direction. Aggression as substitute for skill. The war won at the cost of the victor.',
    question: 'Where are you being asked to take the reins rather than wait for clarity?',
  },
  {
    number: 8,
    name: 'Strength',
    glyph: '◎',
    phase: 2,
    keyword: 'Courage',
    upright: 'The gentle force. Power that does not need to announce itself. The capacity to hold what is wild without crushing it. Strength as compassionate containment, not suppression.',
    shadow: 'Force where patience was needed. The lion tamed into the fear of the lion.',
    question: 'Where in your life does strength look more like gentleness than force?',
  },
  {
    number: 9,
    name: 'The Hermit',
    glyph: '⟟',
    phase: 6,
    keyword: 'Solitude',
    upright: 'The necessary withdrawal. The lantern carried alone. Truth found in silence that cannot be found in company. The Hermit is not running from — they are going toward.',
    shadow: 'Isolation as avoidance. The solitude that calcifies. Wisdom hoarded rather than offered.',
    question: 'What do you need to find in solitude that cannot be given to you by anyone else?',
  },
  {
    number: 10,
    name: 'Wheel of Fortune',
    glyph: '⟲',
    phase: 1,
    keyword: 'Cycles',
    upright: 'The turning that is larger than you. The rhythm that was here before you arrived and will continue after. You are in a cycle — the question is which position you occupy.',
    shadow: 'Passivity dressed as acceptance. The refusal of agency because the wheel will turn anyway.',
    question: 'What cycle are you currently in? Are you resisting it or working with it?',
  },
  {
    number: 11,
    name: 'Justice',
    glyph: '∴',
    phase: 6,
    keyword: 'Truth',
    upright: 'The clear-eyed accounting. Cause and effect seen without distortion. The truth that does not take sides — it simply is. What is out of balance will come to balance. This is not threat; it is physics.',
    shadow: 'Judgment without mercy. The scales used as weapon. Righteousness as cruelty.',
    question: 'Where in your life are you avoiding an honest accounting?',
  },
  {
    number: 12,
    name: 'The Hanged Man',
    glyph: '∇',
    phase: 1,
    keyword: 'Surrender',
    upright: 'The suspension that is not defeat. The pause that reorders everything. What looks like passivity is the willing sacrifice of the old perspective so that a new one can form. You cannot see what you need to see while you are running.',
    shadow: 'Martyrdom. Stasis as identity. The hang that never resolves into the next move.',
    question: 'What would change in your life if you stopped trying to escape this situation and simply inhabited it?',
  },
  {
    number: 13,
    name: 'Death',
    glyph: '⊗',
    phase: 1,
    keyword: 'Transformation',
    upright: 'Not literal death — transformation that cannot be negotiated. The ending that is the condition for the beginning. Something must be released. The card does not ask if you are willing — it shows you what is already happening.',
    shadow: 'Resistance to the inevitable. Clinging to what has already ended.',
    question: 'What has already ended that you are still trying to keep alive?',
  },
  {
    number: 14,
    name: 'Temperance',
    glyph: '≋',
    phase: 5,
    keyword: 'Balance',
    upright: 'The art of the right proportion. The alchemical mixing that cannot be rushed. Patience that is not passivity. The ongoing calibration of a life — not one moment of balance but the sustained practice of returning to it.',
    shadow: 'Avoidance of extremes as fear of depth. Moderation as mediation of everything, commitment to nothing.',
    question: 'Where are you being called to patience that feels like delay but is actually preparation?',
  },
  {
    number: 15,
    name: 'The Devil',
    glyph: '⊘',
    phase: 1,
    keyword: 'Shadow',
    upright: 'The chains that you put on yourself and forgot you were wearing. The binding is real — but it was chosen, and therefore it can be unchosen. Nothing in this card is as powerful as it looks. The light reveals that the chains are loose.',
    shadow: 'Projection of darkness onto external figures. The refusal to own what this card is showing.',
    question: 'What are you bound to that you have been pretending is binding you?',
  },
  {
    number: 16,
    name: 'The Tower',
    glyph: '∇cas',
    phase: 1,
    keyword: 'Revelation',
    upright: 'The structure built on false foundations meets the lightning. Sudden collapse. The Tower does not fall because something went wrong — it falls because something finally went right. The truth arrived.',
    shadow: 'Chaos for its own sake. Destruction as identity. The refusal to rebuild what the lightning was clearing space for.',
    question: 'What needs to fall that you have been propping up?',
  },
  {
    number: 17,
    name: 'The Star',
    glyph: '✧',
    phase: 3,
    keyword: 'Hope',
    upright: 'After the Tower, the Star. The quiet that follows catastrophe. The renewal that was not earned — it was given. Hope that has been tested is different from hope that has never been tested. You know the difference now.',
    shadow: 'Wishful thinking as substitute for action. Hope as avoidance of the work.',
    question: 'What is being renewed in you right now that you have not yet acknowledged?',
  },
  {
    number: 18,
    name: 'The Moon',
    glyph: '◑',
    phase: 2,
    keyword: 'Illusion',
    upright: 'The night journey through uncertain terrain. Things are not what they appear. The path is there — but it cannot be seen in full. Proceed without certainty. The Moon asks you to trust what you feel rather than what you think you see.',
    shadow: 'Paranoia. The descent into the unconscious without an anchor. Fear that shapeshifts and is therefore everywhere.',
    question: 'What is not what it seems in your current situation?',
  },
  {
    number: 19,
    name: 'The Sun',
    glyph: '⊙',
    phase: 4,
    keyword: 'Vitality',
    upright: 'Clarity. Joy without qualification. The expansion that comes when nothing is being hidden. The Sun does not decide which parts of you to illuminate — it illuminates all of you, and all of you can be celebrated.',
    shadow: 'Inflation. The refusal of shadow after the light arrives. Bypass.',
    question: 'Where in your life are you most fully alive right now?',
  },
  {
    number: 20,
    name: 'Judgement',
    glyph: '↑',
    phase: 7,
    keyword: 'Calling',
    upright: 'The awakening call. The moment you can no longer pretend you did not hear. What you have been is not what you are becoming. The old self does not die — it is integrated into the one who rises.',
    shadow: 'Self-judgement that paralyses. The call heard and then re-buried.',
    question: 'What are you being called to that you have been postponing?',
  },
  {
    number: 21,
    name: 'The World',
    glyph: '●',
    phase: 7,
    keyword: 'Completion',
    upright: 'The cycle complete. Not the end — the completion that makes a new beginning possible. You have carried this through. The world is not the destination; it is the acknowledgement that you have arrived, and that something new can now begin.',
    shadow: 'Completion as stasis. The finished cycle used to avoid the next beginning.',
    question: 'What cycle is completing for you right now? Are you allowing it to complete?',
  },
]

// Get today's card — stable for the day, uses TAROT_HISTORY for seen tracking
export function getDailyCard(tarotHistory = []) {
  const today = new Date().toISOString().slice(0, 10)

  // If already drawn today, return it
  const todayEntry = tarotHistory.find(h => h.date === today)
  if (todayEntry) {
    const card = MAJOR_ARCANA.find(c => c.number === todayEntry.cardNumber)
    return { card, entry: todayEntry, isNew: false }
  }

  // Find unseen cards (not in recent 22 days)
  const recentNumbers = tarotHistory.slice(-22).map(h => h.cardNumber)
  const unseen = MAJOR_ARCANA.filter(c => !recentNumbers.includes(c.number))
  const pool = unseen.length > 0 ? unseen : MAJOR_ARCANA

  // Use date as seed for deterministic daily pick
  const dateNum = parseInt(today.replace(/-/g, ''), 10)
  const card = pool[dateNum % pool.length]

  return { card, entry: null, isNew: true }
}

export function getCardByPhase(phase) {
  const cards = MAJOR_ARCANA.filter(c => c.phase === phase)
  return cards[Math.floor(Math.random() * cards.length)]
}
