import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader } from '../components/ui'
import { parseQuestions, type ImportResult } from '../lib/importer'

export default function ImportPage() {
  const { questions, setQuestions } = useStore()
  const [preview, setPreview] = useState<ImportResult | null>(null)
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')
  const [done, setDone] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onFile(f: File) {
    setDone(null)
    const text = await f.text()
    setPreview(parseQuestions(text))
  }

  function apply() {
    if (!preview?.ok) return
    setQuestions(preview.questions, mode)
    setDone(`已匯入 ${preview.count} 題（${mode === 'replace' ? '取代' : '合併'}）。目前題庫共 ${
      mode === 'replace' ? preview.count : new Set([...questions.map((q) => q.id), ...preview.questions.map((q) => q.id)]).size
    } 題。`)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <PageHeader title="匯入題庫" subtitle={`目前題庫共 ${questions.length} 題`} />

      <div className="card space-y-3 p-4 text-sm text-slate-600">
        <p>
          選擇一個 <code className="rounded bg-slate-100 px-1">questions.json</code> 檔案匯入。格式為題目陣列，每題包含
          id、category、question、options、answer 等欄位（詳見 README）。
        </p>
        <p className="text-xs text-slate-400">
          官方題庫請至公路局網站下載後，轉為本格式即可匯入。你的作答進度不會被匯入動作清除。
        </p>
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="text-xs font-medium text-slate-500">匯入方式</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'replace' | 'merge')}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="replace">取代整個題庫</option>
            <option value="merge">合併（更新同 id、新增其餘）</option>
          </select>
        </label>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-700 file:px-4 file:py-2.5 file:font-semibold file:text-white"
      />

      {preview && (
        <div className="card space-y-3 p-4">
          {preview.ok ? (
            <p className="text-sm font-semibold text-emerald-700">✓ 讀取到 {preview.count} 題有效題目</p>
          ) : (
            <p className="text-sm font-semibold text-rose-600">✗ 無法匯入</p>
          )}
          {preview.errors.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-auto text-xs text-rose-500">
              {preview.errors.slice(0, 20).map((e, k) => (
                <li key={k}>• {e}</li>
              ))}
              {preview.errors.length > 20 && <li>…還有 {preview.errors.length - 20} 個問題</li>}
            </ul>
          )}
          {preview.ok && (
            <button className="btn-primary w-full" onClick={apply}>
              確認匯入
            </button>
          )}
        </div>
      )}

      {done && <div className="card bg-emerald-50 p-4 text-sm text-emerald-700">{done}</div>}
    </div>
  )
}
