import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PageHeader, Stat, ProgressBar } from '../components/ui'
import { daysUntil, todayKey, fmtShort } from '../lib/date'
import { coverage, dueCount } from '../lib/stats'

export default function Dashboard() {
  const { questions, progress, mockResults, dailyCounts, settings } = useStore()

  const dLeft = daysUntil(settings.examDate)
  const doneToday = dailyCounts[todayKey()] ?? 0
  const targetPct = settings.dailyTarget ? Math.round((doneToday / settings.dailyTarget) * 100) : 0
  const due = dueCount(questions, progress)
  const cov = coverage(questions, progress)
  const recent = mockResults.slice(0, 5)

  return (
    <div className="space-y-5">
      <PageHeader title="今天來練習" subtitle="利用零碎時間，穩紮穩打通過筆試" />

      {settings.examDate == null && (
        <Link to="/settings" className="card block bg-brand-700 p-4 text-white">
          <div className="text-sm font-semibold">📅 設定考試日期</div>
          <div className="mt-0.5 text-xs text-brand-100">設定後即可顯示倒數天數與每日進度</div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="距離考試"
          value={dLeft == null ? '—' : dLeft < 0 ? '已過' : dLeft}
          hint={dLeft == null ? '尚未設定' : dLeft < 0 ? '' : '天'}
          tone={dLeft != null && dLeft <= 7 ? 'rose' : 'brand'}
        />
        <Stat label="待複習" value={due} hint="到期的錯題" tone={due > 0 ? 'amber' : 'default'} />
      </div>

      <div className="card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-slate-700">今日目標</span>
          <span className="text-sm tabular-nums text-slate-500">
            {doneToday} / {settings.dailyTarget} 題
          </span>
        </div>
        <ProgressBar pct={targetPct} tone={targetPct >= 100 ? 'emerald' : 'brand'} />
        <p className="mt-2 text-xs text-slate-400">
          {targetPct >= 100 ? '🎉 今日目標達成，維持手感！' : '完成任何練習或模擬考都會計入。'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/practice" className="card flex flex-col items-start gap-1 p-4 active:scale-[0.99]">
          <span className="text-2xl">✏️</span>
          <span className="font-semibold text-slate-800">分類練習</span>
          <span className="text-xs text-slate-400">依題型逐項攻克</span>
        </Link>
        <Link to="/mock" className="card flex flex-col items-start gap-1 p-4 active:scale-[0.99]">
          <span className="text-2xl">📝</span>
          <span className="font-semibold text-slate-800">模擬考</span>
          <span className="text-xs text-slate-400">50 題計分測驗</span>
        </Link>
      </div>

      <div className="card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-slate-700">題庫涵蓋率</span>
          <span className="text-sm tabular-nums text-slate-500">
            {cov.seen} / {cov.total}（{cov.pct}%）
          </span>
        </div>
        <ProgressBar pct={cov.pct} tone="brand" />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">近期模擬考</span>
          <Link to="/mock" className="text-xs font-medium text-brand-700">
            去考試 →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400">尚無紀錄，做一次模擬考試試看吧。</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{fmtShort(r.date)}</span>
                <span className="tabular-nums text-slate-600">
                  {r.correct}/{r.total}
                </span>
                <span
                  className={`chip ${r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}
                >
                  {r.scorePct} 分 {r.passed ? '及格' : '待加強'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
