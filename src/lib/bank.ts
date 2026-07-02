import type { Category, Question } from '../types'

export const CATEGORIES = [
  { key: 'signs', label: '交通標誌', emoji: '🚸', desc: '號誌、標線、標誌' },
  { key: 'rules', label: '交通規則', emoji: '📋', desc: '法規與罰則' },
  { key: 'situational', label: '情境／防禦駕駛', emoji: '🛡️', desc: '安全駕駛觀念' },
  { key: 'hazard', label: '危險感知', emoji: '⚠️', desc: '預判並閃避路況風險' },
] as const

export function categoryLabel(c: Category): string {
  return CATEGORIES.find((x) => x.key === c)?.label ?? c
}

export function search(qs: Question[], keyword: string): Question[] {
  const k = keyword.trim().toLowerCase()
  if (!k) return []
  return qs.filter(
    (q) =>
      q.question.toLowerCase().includes(k) ||
      q.options.some((o) => o.toLowerCase().includes(k)) ||
      (q.explanation ?? '').toLowerCase().includes(k) ||
      q.topic.toLowerCase().includes(k) ||
      q.id.toLowerCase().includes(k),
  )
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Deterministic shuffle seeded by a string — used to fix option order per
 * question so it doesn't jump around when navigating back and forth in an exam.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let s = h >>> 0
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build a mock exam of `size` questions, biased ~20% toward hazard/situational (2026 format). */
export function buildMock(qs: Question[], size = 50): Question[] {
  if (qs.length <= size) return shuffle(qs)
  const hazard = shuffle(qs.filter((q) => q.category === 'hazard' || q.category === 'situational'))
  const rest = shuffle(qs.filter((q) => q.category === 'signs' || q.category === 'rules'))
  const nHazard = Math.min(hazard.length, Math.round(size * 0.2))
  const picked = [...hazard.slice(0, nHazard), ...rest.slice(0, size - nHazard)]
  if (picked.length < size) {
    const used = new Set(picked.map((p) => p.id))
    picked.push(...shuffle(qs.filter((q) => !used.has(q.id))).slice(0, size - picked.length))
  }
  return shuffle(picked).slice(0, size)
}
