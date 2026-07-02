import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader, EmptyState } from '../components/ui'
import { QuestionCard } from '../components/QuestionCard'
import { buildMock } from '../lib/bank'
import type { MockResult, Question } from '../types'

type Phase = 'intro' | 'exam' | 'result'
const EXAM_SIZE = 50

export default function MockExam() {
  const { questions, settings, flagged, toggleFlag, recordAnswer, addMockResult } = useStore()
  const [phase, setPhase] = useState<Phase>('intro')
  const [examQs, setExamQs] = useState<Question[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [cur, setCur] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [result, setResult] = useState<MockResult | null>(null)

  function begin() {
    const qs = buildMock(questions, EXAM_SIZE)
    setExamQs(qs)
    setAnswers(new Array(qs.length).fill(null))
    setCur(0)
    setStartedAt(Date.now())
    setResult(null)
    setPhase('exam')
  }

  function choose(original: number) {
    setAnswers((a) => {
      const next = [...a]
      next[cur] = original
      return next
    })
  }

  const answeredCount = answers.filter((a) => a != null).length

  function submit() {
    const wrongIds: string[] = []
    const uncertainIds: string[] = []
    let correct = 0
    examQs.forEach((q, idx) => {
      const chosen = answers[idx]
      const isCorrect = chosen === q.answer
      if (isCorrect) correct++
      else wrongIds.push(q.id)
      if (flagged[q.id]) uncertainIds.push(q.id)
      recordAnswer(q.id, isCorrect)
    })
    const scorePct = Math.round((correct / examQs.length) * 100)
    const r: MockResult = {
      id: `mock-${startedAt}`,
      date: Date.now(),
      total: examQs.length,
      correct,
      scorePct,
      passed: scorePct >= settings.passPct,
      wrongIds,
      uncertainIds,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
    }
    addMockResult(r)
    setResult(r)
    setPhase('result')
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="模擬考" />
        <EmptyState title="尚無題目">請先到「更多 → 匯入題庫」載入題目。</EmptyState>
      </div>
    )
  }

  // ---- Intro ----
  if (phase === 'intro') {
    const size = Math.min(EXAM_SIZE, questions.length)
    return (
      <div className="space-y-4">
        <PageHeader title="模擬考" subtitle="仿照 2026 新制：全選擇題、含危險感知題" />
        <div className="card space-y-3 p-5">
          <Row label="題數" value={`${size} 題`} />
          <Row label="及格標準" value={`${settings.passPct} 分`} />
          <Row label="計分方式" value="每題 2 分，滿分 100" />
          <Row label="作答方式" value="作答中不顯示答案，交卷後計分" />
          {questions.length < EXAM_SIZE && (
            <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
              目前題庫僅 {questions.length} 題，未達 50 題。匯入公路局完整題庫後即為完整模擬考。
            </p>
          )}
        </div>
        <button className="btn-primary w-full" onClick={begin}>
          開始作答
        </button>
      </div>
    )
  }

  // ---- Result ----
  if (phase === 'result' && result) {
    const reviewIds = [...new Set([...result.wrongIds, ...result.uncertainIds])]
    const reviewQs = reviewIds
      .map((id) => examQs.find((q) => q.id === id))
      .filter((q): q is Question => !!q)
    return (
      <div className="space-y-4">
        <PageHeader title="模擬考結果" />
        <div className={`card p-6 text-center ${result.passed ? 'ring-emerald-200' : 'ring-rose-200'}`}>
          <div className={`text-6xl font-bold ${result.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
            {result.scorePct}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            答對 {result.correct} / {result.total} 題 ·{' '}
            {result.passed ? '🎉 及格' : '再接再厲'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            用時約 {Math.floor(result.durationSec / 60)} 分 {result.durationSec % 60} 秒 · 標記不確定{' '}
            {result.uncertainIds.length} 題
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={() => setPhase('intro')}>
            回主頁
          </button>
          <button className="btn-primary" onClick={begin}>
            再考一次
          </button>
        </div>

        {reviewQs.length > 0 && (
          <div className="space-y-3">
            <h2 className="pt-2 text-sm font-semibold text-slate-600">
              檢討（錯題與不確定，共 {reviewQs.length} 題）
            </h2>
            {reviewQs.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                mode="review"
                value={answers[examQs.findIndex((x) => x.id === q.id)]}
                flagged={!!flagged[q.id]}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---- Exam (one question at a time) ----
  const q = examQs[cur]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">
          第 {cur + 1} / {examQs.length} 題
        </span>
        <span className="text-xs text-slate-400">已作答 {answeredCount}</span>
      </div>

      <QuestionCard
        question={q}
        mode="exam"
        value={answers[cur]}
        onChange={choose}
        flagged={!!flagged[q.id]}
        onToggleFlag={() => toggleFlag(q.id)}
        index={cur}
        total={examQs.length}
      />

      <div className="flex gap-3">
        <button className="btn-ghost flex-1" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0}>
          上一題
        </button>
        {cur + 1 < examQs.length ? (
          <button className="btn-primary flex-1" onClick={() => setCur((c) => c + 1)}>
            下一題
          </button>
        ) : (
          <button className="btn-primary flex-1" onClick={submit}>
            交卷
          </button>
        )}
      </div>

      {/* Question palette */}
      <div className="card p-3">
        <div className="grid grid-cols-8 gap-1.5">
          {examQs.map((eq, idx) => {
            const done = answers[idx] != null
            const isFlag = flagged[eq.id]
            const active = idx === cur
            return (
              <button
                key={eq.id}
                onClick={() => setCur(idx)}
                className={`relative aspect-square rounded-md text-xs font-medium transition ${
                  active
                    ? 'bg-brand-700 text-white'
                    : done
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx + 1}
                {isFlag && <span className="absolute -right-0.5 -top-0.5 text-[10px] text-amber-500">★</span>}
              </button>
            )
          })}
        </div>
      </div>

      <button className="btn-ghost w-full" onClick={submit}>
        提前交卷（{answeredCount}/{examQs.length} 已作答）
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  )
}
