import { useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader } from '../components/ui'

export default function Settings() {
  const { settings, updateSettings, resetProgress, restoreBank, resetAll } = useStore()
  const [confirmProgress, setConfirmProgress] = useState(false)
  const [showAdv, setShowAdv] = useState(false)
  const [wipeText, setWipeText] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

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

        {/* Clear progress — deliberate two-step, keeps the question bank */}
        {!confirmProgress ? (
          <button className="btn-ghost w-full" onClick={() => setConfirmProgress(true)}>
            清除作答進度
          </button>
        ) : (
          <div className="space-y-2 rounded-xl bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              將清除所有<b>作答進度、錯題本與模擬考成績</b>。題庫（1,090 題）與設定會保留。此動作無法復原。
            </p>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setConfirmProgress(false)}>
                取消
              </button>
              <button
                className="btn flex-1 bg-rose-600 text-white"
                onClick={() => {
                  resetProgress()
                  setConfirmProgress(false)
                  flash('已清除作答進度')
                }}
              >
                確定清除
              </button>
            </div>
          </div>
        )}

        <button
          className="w-full pt-1 text-left text-xs font-medium text-slate-400"
          onClick={() => setShowAdv((v) => !v)}
        >
          {showAdv ? '▾' : '▸'} 進階
        </button>

        {showAdv && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-3">
            <div>
              <button className="btn-ghost w-full" onClick={() => { restoreBank(); flash('已還原內建題庫') }}>
                還原內建題庫
              </button>
              <p className="mt-1 text-xs text-slate-400">
                重新載入內建 1,090 題（例如匯入的題庫有誤時）。<b>不會</b>清除你的進度。
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-sm font-medium text-rose-700">清除所有資料</p>
              <p className="mt-0.5 text-xs text-slate-500">
                清除進度、錯題、模擬考成績與設定。題庫會保留為內建 1,090 題，App 不會變空白。無法復原。
              </p>
              <p className="mt-2 text-xs text-slate-500">
                請輸入 <code className="rounded bg-white px-1 font-mono text-rose-700">清除</code> 以確認：
              </p>
              <input
                value={wipeText}
                onChange={(e) => setWipeText(e.target.value)}
                placeholder="清除"
                className="mt-1 w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <button
                disabled={wipeText.trim() !== '清除'}
                onClick={() => {
                  resetAll()
                  setWipeText('')
                  setShowAdv(false)
                  flash('已清除所有資料，題庫已保留')
                }}
                className="btn mt-2 w-full bg-rose-600 text-white disabled:opacity-40"
              >
                清除所有資料
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="px-1 text-xs text-slate-400">
        所有資料僅儲存在本機瀏覽器（localStorage），不會上傳，也無需登入。
      </p>
    </div>
  )
}
