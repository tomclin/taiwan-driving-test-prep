import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader, EmptyState } from '../components/ui'
import { QuestionCard } from '../components/QuestionCard'
import { search } from '../lib/bank'

export default function Search() {
  const questions = useStore((s) => s.questions)
  const [kw, setKw] = useState('')

  const results = useMemo(() => search(questions, kw).slice(0, 50), [questions, kw])

  return (
    <div className="space-y-4">
      <PageHeader title="搜尋題庫" subtitle={`共 ${questions.length} 題`} />
      <input
        value={kw}
        onChange={(e) => setKw(e.target.value)}
        placeholder="輸入關鍵字，例如：酒駕、速限、行人、標誌"
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
        autoFocus
      />

      {kw.trim() === '' ? (
        <EmptyState title="輸入關鍵字開始搜尋">可搜尋題目、選項、解析與主題。</EmptyState>
      ) : results.length === 0 ? (
        <EmptyState title="找不到相符的題目">換個關鍵字試試。</EmptyState>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">找到 {results.length} 題{results.length === 50 ? '（僅顯示前 50 題）' : ''}</p>
          {results.map((q) => (
            <QuestionCard key={q.id} question={q} mode="review" />
          ))}
        </div>
      )}
    </div>
  )
}
