// Ceremony Arc engine — scheduling, daily activation, completion

import { CEREMONY_ARCS, getDayContent, getPhaseLabel } from '../data/ceremonies'

export function startCeremony(arcId, arcLength, intention = '') {
  const arc = CEREMONY_ARCS[arcId]
  if (!arc) throw new Error('Unknown arc: ' + arcId)
  return {
    id: `ceremony_${Date.now()}`,
    arcId,
    arcLength,
    intention,
    startDate: new Date().toISOString().slice(0, 10),
    dayIndex: 0,
    completedDays: [],
    active: true,
  }
}

export function getTodayContent(ceremony) {
  const { arcId, arcLength, dayIndex } = ceremony
  const arc = CEREMONY_ARCS[arcId]
  if (!arc) return null
  const dayContent = getDayContent(arcId, dayIndex, arcLength)
  const phaseLabel = getPhaseLabel(arcId, dayIndex, arcLength)
  const dayNum = dayIndex + 1
  const isLast = dayNum >= arcLength

  return {
    arcName: arc.name,
    arcGlyph: arc.glyph,
    dayNum,
    arcLength,
    phaseLabel,
    isLast,
    ...dayContent,
    closing: isLast ? arc.closing : null,
  }
}

export function advanceDay(ceremony) {
  const newIndex = ceremony.dayIndex + 1
  const isComplete = newIndex >= ceremony.arcLength
  return {
    ...ceremony,
    dayIndex: newIndex,
    completedDays: [...ceremony.completedDays, ceremony.dayIndex],
    active: !isComplete,
    completedAt: isComplete ? new Date().toISOString() : undefined,
  }
}

export function markDayComplete(ceremony) {
  return advanceDay(ceremony)
}

export function getDaysRemaining(ceremony) {
  return Math.max(0, ceremony.arcLength - ceremony.dayIndex)
}

export function isDayAvailable(ceremony) {
  // Can only advance one day at a time — check if today's date is after last completion
  const today = new Date().toISOString().slice(0, 10)
  const lastCompleted = ceremony.completedDays.length
  if (lastCompleted === 0) return true  // Haven't started day 1 yet

  // Day is available if we haven't completed today's date
  const startDate = new Date(ceremony.startDate)
  const expectedDate = new Date(startDate)
  expectedDate.setDate(expectedDate.getDate() + ceremony.dayIndex)
  const expectedDateStr = expectedDate.toISOString().slice(0, 10)

  return today >= expectedDateStr
}
