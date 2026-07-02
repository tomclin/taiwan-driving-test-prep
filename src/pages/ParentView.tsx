import { useStore } from '../store/useStore'
import { PageHeader, Stat, ProgressBar, EmptyState } from '../components/ui'
import { coverage, categoryStats, weakest, wrongCount } from '../lib/stats'
import { fmtShort, daysUntil } from '../lib/date'

export default function ParentView() {
  const { questions, progress, mockResults, settings, dailyCounts } = useStore()

  const cov = coverage(questions, progress)
  const cats = categoryStats(questions, progress)
  const weak = weakest(questions, progress)
  const outstanding = wrongCount(questions, progress)
  const dLeft = daysUntil(settings.examDate)
  const recent = mockResults.slice(0, 8)

  const last7 = Array.from({ length: 7 }, (_, k) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - k))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { key, label: `${d.getMonth() + 1}/${d.getDate()}`, count: dailyCounts[key] ?? 0 }
  })
  const maxDay = Math.max(1, ...last7.map((d) => d.count))

  return (
    <div className="space-y-5">
      <PageHeader title="家長檢視" subtitle="孩子的整體準備進度總覽" />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="距離考試" value={dLeft == null ? '—' : dLeft < 0 ? '已過' : dLeft} hint={dLeft == null ? '未設定' : '天'} tone={dLeft != null && dLeft <= 7 ? 'rose' : 'brand'} />
        <Stat label="題庫涵蓋率" value={`${cov.pct}%`} hint={`${cov.seen}/${cov.total} 題`} tone="brand" />
        <Stat label="模擬考次數" value={mockResults.length} />
        <Stat label="待清錯題" value={outstanding} tone={outstanding ? 'amber' : 'default'} />
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">近 7 天練習量</h2>
        <div className="flex h-24 items-end justify-between gap-1.5">
          {last7.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 0 }}
                title={`${d.count} 題`}
              />
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">各題型正確率</h2>
        <div className="space-y-3">
          {cats.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {c.emoji} {c.label}
                </span>
                <span className="tabular-nums text-slate-500">
                  {c.acc == null ? '尚未作答' : `${c.acc}%`} · {c.seen}/{c.total} 題
                </span>
              </div>
              <ProgressBar
                pct={c.acc ?? 0}
                tone={c.acc == null ? 'brand' : c.acc >= 85 ? 'emerald' : c.acc >= 60 ? 'brand' : 'amber'}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">最需要加強</h2>
        {weak.length === 0 ? (
          <p className="text-sm text-slate-400">資料不足，多做幾題後就會顯示。</p>
        ) : (
          <ul className="space-y-1.5">
            {weak.slice(0, 3).map((c) => (
              <li key={c.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {c.emoji} {c.label}
                </span>
                <span className="chip bg-amber-100 text-amber-700">正確率 {c.acc}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">近期模擬考成績</h2>
        {recent.length === 0 ? (
          <EmptyState title="尚無模擬考紀錄" />
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{fmtShort(r.date)}</span>
                <span className="tabular-nums text-slate-600">
                  {r.correct}/{r.total}
                </span>
                <span className={`chip ${r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                  {r.scorePct} 分
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
