import { useStore } from '../store/useStore'
import { PageHeader } from '../components/ui'

export default function Settings() {
  const { settings, updateSettings, resetProgress, resetAll } = useStore()

  return (
    <div className="space-y-4">
      <PageHeader title="設定" />

      <div className="card space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">考試日期</span>
          <input
            type="date"
            value={settings.examDate ?? ''}
            onChange={(e) => updateSettings({ examDate: e.target.value || null })}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">每日目標（題）</span>
          <input
            type="number"
            min={5}
            max={300}
            value={settings.dailyTarget}
            onChange={(e) => updateSettings({ dailyTarget: Math.max(1, Number(e.target.value) || 0) })}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">及格分數</span>
          <input
            type="number"
            min={1}
            max={100}
            value={settings.passPct}
            onChange={(e) => updateSettings({ passPct: Math.min(100, Math.max(1, Number(e.target.value) || 0)) })}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base"
          />
          <span className="mt-1 block text-xs text-slate-400">汽車筆試官方及格標準約為 85 分。</span>
        </label>
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold text-slate-700">資料管理</h2>
        <button
          className="btn-ghost w-full"
          onClick={() => {
            if (confirm('確定要清除所有作答進度、錯題與模擬考紀錄嗎？（題庫會保留）')) resetProgress()
          }}
        >
          清除作答進度
        </button>
        <button
          className="btn w-full bg-rose-50 text-rose-600"
          onClick={() => {
            if (confirm('確定要重設全部資料嗎？題庫將回復為內建示範題庫。')) resetAll()
          }}
        >
          重設全部（含題庫）
        </button>
      </div>

      <p className="px-1 text-xs text-slate-400">
        所有資料僅儲存在本機瀏覽器（localStorage），不會上傳，也無需登入。
      </p>
    </div>
  )
}
