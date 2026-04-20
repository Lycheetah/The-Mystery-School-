// The Uncommon Room — Unlock Engine
// The hidden curriculum. 35 subjects beyond the main 220.
// Unlocks when the student has demonstrated real practice depth.

export const UNLOCK_THRESHOLD = 15  // subjects at Practising or Integrated mastery

/**
 * Count subjects at Practising (3) or Integrated (4) mastery
 */
export function countHighMastery(progress) {
  return Object.values(progress || {}).filter(p => (p?.mastery || 0) >= 3).length
}

/**
 * Check if the main curriculum unlock condition is met
 */
export function meetsUnlockCondition(progress) {
  return countHighMastery(progress) >= UNLOCK_THRESHOLD
}

/**
 * Progress toward unlock — returns { count, threshold, pct }
 */
export function getUnlockProgress(progress) {
  const count = countHighMastery(progress)
  return {
    count,
    threshold: UNLOCK_THRESHOLD,
    pct: Math.min(100, Math.round((count / UNLOCK_THRESHOLD) * 100)),
    met: count >= UNLOCK_THRESHOLD,
  }
}
