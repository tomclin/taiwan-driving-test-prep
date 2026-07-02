export const DAY = 86_400_000

export function startOfDay(t = Date.now()): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function todayKey(t = Date.now()): string {
  const d = new Date(t)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Whole days from today until the given ISO date (yyyy-mm-dd). Null if unset. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const target = startOfDay(new Date(`${iso}T00:00:00`).getTime())
  return Math.round((target - startOfDay()) / DAY)
}

export function fmtShort(t: number): string {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
