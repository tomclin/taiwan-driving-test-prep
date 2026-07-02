import { DAY } from './date'
import type { Progress } from '../types'

// Spaced-repetition intervals: same day → +1 day → +3 days → +7 days → graduated.
const STEPS = [0, 1 * DAY, 3 * DAY, 7 * DAY]

export function newProgress(id: string): Progress {
  return {
    id,
    mistakeCount: 0,
    correctCount: 0,
    confidence: 0,
    lastSeen: null,
    nextReview: null,
    srsStage: 0,
  }
}

/**
 * Update a question's progress after it's answered.
 * A question enters the spaced-repetition queue the first time it's answered wrong,
 * and graduates out after being answered correctly through the full interval ladder.
 */
export function scheduleAfterAnswer(
  p: Progress,
  correct: boolean,
  confident = false,
  now = Date.now(),
): Progress {
  if (!correct) {
    return {
      ...p,
      mistakeCount: p.mistakeCount + 1,
      confidence: 0,
      srsStage: 0,
      lastSeen: now,
      nextReview: now + STEPS[0], // due again the same day
    }
  }

  const inQueue = p.mistakeCount > 0
  const nextStage = Math.min(p.srsStage + 1, STEPS.length)
  const graduated = nextStage >= STEPS.length

  return {
    ...p,
    correctCount: p.correctCount + 1,
    confidence: confident ? 2 : 1,
    srsStage: nextStage,
    lastSeen: now,
    nextReview: inQueue ? (graduated ? null : now + STEPS[nextStage]) : p.nextReview,
  }
}

export function isDue(p: Progress | undefined, now = Date.now()): boolean {
  return !!p && p.nextReview != null && p.nextReview <= now
}
