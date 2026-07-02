import { useEffect, useMemo, useState } from 'react'
import type { Question } from '../types'
import { seededShuffle, categoryLabel } from '../lib/bank'

type Mode = 'practice' | 'exam' | 'review'

interface Props {
  question: Question
  mode: Mode
  /** Selected ORIGINAL option index (controlled — used for exam/review). */
  value?: number | null
  onChange?: (originalIndex: number) => void
  /** Practice mode: fired once when the learner picks an answer. */
  onAnswered?: (correct: boolean, originalIndex: number) => void
  flagged?: boolean
  onToggleFlag?: () => void
  index?: number
  total?: number
}

const CAT_COLOR: Record<string, string> = {
  signs: 'bg-sky-100 text-sky-700',
  rules: 'bg-violet-100 text-violet-700',
  situational: 'bg-emerald-100 text-emerald-700',
  hazard: 'bg-amber-100 text-amber-700',
}

export function QuestionCard({
  question,
  mode,
  value,
  onChange,
  onAnswered,
  flagged,
  onToggleFlag,
  index,
  total,
}: Props) {
  // Stable, shuffled option order so the answer isn't always in the same slot.
  const order = useMemo(
    () => seededShuffle(question.options.map((_, i) => i), question.id),
    [question.id],
  )

  // Practice mode tracks its own selection; exam/review are controlled via `value`.
  const [local, setLocal] = useState<number | null>(null)
  useEffect(() => setLocal(null), [question.id])

  const selected = mode === 'practice' ? local : (value ?? null)
  const revealed = mode === 'review' || (mode === 'practice' && selected != null)

  function pick(original: number) {
    if (mode === 'review') return
    if (mode === 'practice') {
      if (local != null) return // lock after answering
      setLocal(original)
      onAnswered?.(original === question.answer, original)
    } else {
      onChange?.(original)
    }
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`chip ${CAT_COLOR[question.category] ?? 'bg-slate-100 text-slate-600'}`}>
            {categoryLabel(question.category)}
          </span>
          {question.topic && <span className="text-xs text-slate-400">{question.topic}</span>}
        </div>
        <div className="flex items-center gap-3">
          {index != null && total != null && (
            <span className="text-xs font-medium text-slate-400">
              {index + 1} / {total}
            </span>
          )}
          {onToggleFlag && (
            <button
              onClick={onToggleFlag}
              aria-label="標記為不確定"
              className={`text-lg leading-none transition ${flagged ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
            >
              {flagged ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>

      <p className="text-lg font-semibold leading-relaxed text-slate-900">{question.question}</p>

      {question.image && (
        <img src={question.image} alt="" className="mt-3 max-h-56 w-full rounded-xl object-contain" />
      )}
      {question.video && (
        <video src={question.video} controls playsInline className="mt-3 w-full rounded-xl" />
      )}

      <div className="mt-4 space-y-2.5">
        {order.map((original) => {
          const isCorrect = original === question.answer
          const isChosen = selected === original
          let cls = 'border-slate-200 bg-white active:bg-slate-50'
          if (revealed && isCorrect) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800'
          else if (revealed && isChosen && !isCorrect) cls = 'border-rose-400 bg-rose-50 text-rose-700'
          else if (!revealed && isChosen) cls = 'border-brand-500 bg-brand-50 text-brand-800'
          const optImg = question.optionImages?.[original]
          return (
            <button
              key={original}
              onClick={() => pick(original)}
              disabled={mode === 'review'}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-base font-medium transition ${optImg ? '' : 'text-left'} ${cls}`}
            >
              {optImg ? (
                <span className="flex flex-1 items-center justify-center py-1">
                  <img src={optImg} alt={`選項 ${original + 1}`} className="h-24 w-auto object-contain" />
                </span>
              ) : (
                <span className="flex-1">{question.options[original]}</span>
              )}
              {revealed && isCorrect && <span className="text-emerald-600">✓</span>}
              {revealed && isChosen && !isCorrect && <span className="text-rose-500">✗</span>}
            </button>
          )
        })}
      </div>

      {revealed && question.explanation && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-700">解析：</span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
