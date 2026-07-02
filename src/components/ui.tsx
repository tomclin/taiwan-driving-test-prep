import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function Stat({ label, value, hint, tone = 'default' }: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'brand' | 'amber' | 'rose'
}) {
  const toneCls = {
    default: 'text-slate-900',
    brand: 'text-brand-700',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  }[tone]
  return (
    <div className="card p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${toneCls}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}

export function ProgressBar({ pct, tone = 'brand' }: { pct: number; tone?: 'brand' | 'amber' | 'emerald' }) {
  const bg = { brand: 'bg-brand-600', amber: 'bg-amber-500', emerald: 'bg-emerald-500' }[tone]
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${bg} transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
    </div>
  )
}
