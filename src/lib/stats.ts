import type { Progress, Question } from '../types'
import { CATEGORIES } from './bank'

type ProgMap = Record<string, Progress>

export function coverage(qs: Question[], prog: ProgMap) {
  const seen = qs.filter((q) => prog[q.id]?.lastSeen).length
  return { seen, total: qs.length, pct: qs.length ? Math.round((seen / qs.length) * 100) : 0 }
}

export interface CategoryStat {
  key: string
  label: string
  emoji: string
  total: number
  seen: number
  attempts: number
  acc: number | null
}

export function categoryStats(qs: Question[], prog: ProgMap): CategoryStat[] {
  return CATEGORIES.map((c) => {
    const inCat = qs.filter((q) => q.category === c.key)
    const seen = inCat.filter((q) => prog[q.id]?.lastSeen).length
    let correct = 0
    let attempts = 0
    for (const q of inCat) {
      const p = prog[q.id]
      if (p) {
        correct += p.correctCount
        attempts += p.correctCount + p.mistakeCount
      }
    }
    return {
      key: c.key,
      label: c.label,
      emoji: c.emoji,
      total: inCat.length,
      seen,
      attempts,
      acc: attempts ? Math.round((correct / attempts) * 100) : null,
    }
  })
}

export function weakest(qs: Question[], prog: ProgMap): CategoryStat[] {
  return categoryStats(qs, prog)
    .filter((c) => c.attempts >= 3 && c.acc != null)
    .sort((a, b) => (a.acc as number) - (b.acc as number))
}

export function dueCount(qs: Question[], prog: ProgMap, now = Date.now()): number {
  return qs.filter((q) => {
    const p = prog[q.id]
    return p && p.nextReview != null && p.nextReview <= now
  }).length
}

export function wrongCount(qs: Question[], prog: ProgMap): number {
  return qs.filter((q) => (prog[q.id]?.mistakeCount ?? 0) > 0).length
}
