// The Void Room — Unlock Engine
// 40 Tier IV convergence subjects. The deepest layer of the school.
// These are not taught — they are encountered.
//
// Unlock requires:
//   ≥30 uncommon subjects at Reading or above (mastery ≥ 2)
//   AND ≥50 main subjects at Practising or Integrated (mastery ≥ 3)

import { SUBJECTS } from '../data/subjects'
import { UNCOMMON_SUBJECTS } from '../data/uncommon'

export const VOID_UNLOCK = {
  uncommonReading: 30,    // uncommon subjects at mastery >= 2
  mainPractising:  50,    // main subjects at mastery >= 3
}

/**
 * Count uncommon subjects at Reading+ (mastery >= 2)
 */
export function countUncommonReading(progress) {
  return UNCOMMON_SUBJECTS.filter(s => (progress[s.id]?.mastery || 0) >= 2).length
}

/**
 * Count main subjects at Practising/Integrated (mastery >= 3)
 */
export function countMainPractising(progress) {
  return SUBJECTS.filter(s => (progress[s.id]?.mastery || 0) >= 3).length
}

/**
 * Check if both void unlock conditions are met
 */
export function meetsVoidUnlock(progress) {
  return (
    countUncommonReading(progress) >= VOID_UNLOCK.uncommonReading &&
    countMainPractising(progress) >= VOID_UNLOCK.mainPractising
  )
}

/**
 * Progress toward void unlock — returns { uncommon, main }
 */
export function getVoidUnlockProgress(progress) {
  const uncommon = countUncommonReading(progress)
  const main = countMainPractising(progress)
  return {
    uncommon: {
      count: uncommon,
      threshold: VOID_UNLOCK.uncommonReading,
      pct: Math.min(100, Math.round((uncommon / VOID_UNLOCK.uncommonReading) * 100)),
    },
    main: {
      count: main,
      threshold: VOID_UNLOCK.mainPractising,
      pct: Math.min(100, Math.round((main / VOID_UNLOCK.mainPractising) * 100)),
    },
    met: uncommon >= VOID_UNLOCK.uncommonReading && main >= VOID_UNLOCK.mainPractising,
  }
}
