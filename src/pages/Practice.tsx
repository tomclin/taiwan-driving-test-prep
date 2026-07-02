import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader, EmptyState, ProgressBar } from '../components/ui'
import { QuestionCard } from '../components/QuestionCard'
import { CATEGORIES, shuffle } from '../lib/bank'
import { isDue } from '../lib/srs'
import type { Question } from '../types'

type Deck = { key: string; label: string; emoji: string; desc: string; questions: Question[] }

export default function Practice() {
  const { questions, progress, flagged, recordAnswer, toggleFlag } = useStore()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [seenCount, setSeenCount] = useState(0)

  const decks: Deck[] = useMemo(() => {
    const base: Deck[] = CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      emoji: c.emoji,
      desc: c.desc,
      questions: questions.filter((q) => q.category === c.key),
    }))
    const wrong = questions.filter((q) => (progress[q.id]?.mistakeCount ?? 0) > 0)
    const due = questions.filter((q) => isDue(progress[q.id]))
    return [
      ...base,
      { key: 'due', label: '待複習', emoji: '🔁', desc: '到期的間隔複習題', questions: due },
      { key: 'wrong', label: '錯題練習', emoji: '❌', desc: '所有曾答錯的題目', questions: wrong },
    ]
  }, [questions, progress])

  function start(d: Deck) {
    setDeck({ ...d, questions: shuffle(d.questions) })
    setI(0)
    setAnswered(false)
    setCorrectCount(0)
    setSeenCount(0)
  }

  function onAnswered(correct: boolean) {
    if (answered || !deck) return
    setAnswered(true)
    setSeenCount((n) => n + 1)
    if (correct) setCorrectCount((n) => n + 1)
    recordAnswer(deck.questions[i].id, correct)
  }

  function next() {
    if (!deck) return
    if (i + 1 >= deck.questions.length) {
      setI(deck.questions.length) // move to summary
    } else {
      setI(i + 1)
      setAnswered(false)
    }
  }

  // ---- Category chooser ----
  if (!deck) {
    return (
      <div className="space-y-4">
        <PageHeader title="分類練習" subtitle="選一個題型開始，隨時可停。" />
        <div className="grid grid-cols-2 gap-3">
          {decks.map((d) => (
            <button
              key={d.key}
              onClick={() => d.questions.length && start(d)}
              disabled={d.questions.length === 0}
              className="card flex flex-col items-start gap-1 p-4 text-left active:scale-[0.99] disabled:opacity-40"
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="font-semibold text-slate-800">{d.label}</span>
              <span className="text-xs text-slate-400">{d.desc}</span>
              <span className="mt-1 text-xs font-medium text-brand-700">{d.questions.length} 題</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---- Summary ----
  if (i >= deck.questions.length) {
    const pct = seenCount ? Math.round((correctCount / seenCount) * 100) : 0
    return (
      <div className="space-y-4">
        <PageHeader title="練習完成" subtitle={deck.label} />
        <div className="card p-6 text-center">
          <div className="text-5xl font-bold text-brand-700">{pct}%</div>
          <p className="mt-1 text-sm text-slate-500">
            答對 {correctCount} / {seenCount} 題
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={() => setDeck(null)}>
            回選單
          </button>
          <button className="btn-primary" onClick={() => start(deck)}>
            再練一次
          </button>
        </div>
      </div>
    )
  }

  // ---- Active question ----
  const q = deck.questions[i]
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setDeck(null)} className="text-sm font-medium text-slate-400">
          ← 結束
        </button>
        <div className="flex-1">
          <ProgressBar pct={((i + 1) / deck.questions.length) * 100} />
        </div>
        <span className="text-sm font-medium text-slate-500">{deck.label}</span>
      </div>

      <QuestionCard
        question={q}
        mode="practice"
        value={undefined}
        onAnswered={onAnswered}
        flagged={!!flagged[q.id]}
        onToggleFlag={() => toggleFlag(q.id)}
        index={i}
        total={deck.questions.length}
      />

      <button className="btn-primary w-full" onClick={next} disabled={!answered}>
        {i + 1 >= deck.questions.length ? '看結果' : '下一題'}
      </button>
    </div>
  )
}
