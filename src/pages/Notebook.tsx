import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PageHeader, EmptyState, Stat, ProgressBar } from '../components/ui'
import { QuestionCard } from '../components/QuestionCard'
import { shuffle } from '../lib/bank'
import { isDue } from '../lib/srs'
import { fmtShort } from '../lib/date'
import type { Question } from '../types'

type Tab = 'wrong' | 'flagged'

export default function Notebook() {
  const { questions, progress, flagged, recordAnswer, toggleFlag } = useStore()
  const [tab, setTab] = useState<Tab>('wrong')

  // review runner state
  const [deck, setDeck] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(false)

  const due = useMemo(() => questions.filter((q) => isDue(progress[q.id])), [questions, progress])
  const wrong = useMemo(
    () =>
      questions
        .filter((q) => (progress[q.id]?.mistakeCount ?? 0) > 0)
        .sort((a, b) => (progress[b.id]!.mistakeCount ?? 0) - (progress[a.id]!.mistakeCount ?? 0)),
    [questions, progress],
  )
  const flaggedQs = useMemo(() => questions.filter((q) => flagged[q.id]), [questions, flagged])

  function startReview(list: Question[]) {
    if (!list.length) return
    setDeck(shuffle(list))
    setI(0)
    setAnswered(false)
  }

  // ---- Review runner (spaced repetition) ----
  if (deck) {
    if (i >= deck.length) {
      return (
        <div className="space-y-4">
          <PageHeader title="複習完成" subtitle="答對的題目會依間隔（當天／隔天／3天／7天）再出現" />
          <div className="card p-6 text-center text-slate-600">🎉 本輪複習結束</div>
          <button className="btn-primary w-full" onClick={() => setDeck(null)}>
            返回錯題本
          </button>
        </div>
      )
    }
    const q = deck[i]
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setDeck(null)} className="text-sm font-medium text-slate-400">
            ← 結束
          </button>
          <div className="flex-1">
            <ProgressBar pct={((i + 1) / deck.length) * 100} />
          </div>
          <span className="text-sm text-slate-500">複習</span>
        </div>
        <QuestionCard
          question={q}
          mode="practice"
          onAnswered={(correct) => {
            if (answered) return
            setAnswered(true)
            recordAnswer(q.id, correct)
          }}
          flagged={!!flagged[q.id]}
          onToggleFlag={() => toggleFlag(q.id)}
          index={i}
          total={deck.length}
        />
        <button
          className="btn-primary w-full"
          disabled={!answered}
          onClick={() => {
            setI(i + 1)
            setAnswered(false)
          }}
        >
          {i + 1 >= deck.length ? '完成' : '下一題'}
        </button>
      </div>
    )
  }

  // ---- Overview ----
  const list = tab === 'wrong' ? wrong : flaggedQs
  return (
    <div className="space-y-4">
      <PageHeader title="錯題本" subtitle="用間隔複習把錯題變成會的題" />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="待複習" value={due.length} tone={due.length ? 'amber' : 'default'} />
        <Stat label="錯題總數" value={wrong.length} tone="rose" />
        <Stat label="已標記" value={flaggedQs.length} />
      </div>

      <button
        className="btn-primary w-full"
        disabled={due.length === 0}
        onClick={() => startReview(due)}
      >
        {due.length ? `開始複習到期的 ${due.length} 題` : '目前沒有到期的複習題'}
      </button>

      <div className="flex gap-2">
        <TabBtn active={tab === 'wrong'} onClick={() => setTab('wrong')}>
          全部錯題（{wrong.length}）
        </TabBtn>
        <TabBtn active={tab === 'flagged'} onClick={() => setTab('flagged')}>
          已標記（{flaggedQs.length}）
        </TabBtn>
      </div>

      {list.length === 0 ? (
        <EmptyState title={tab === 'wrong' ? '還沒有錯題' : '沒有標記的題目'}>
          {tab === 'wrong' ? '做題答錯後會自動加入這裡。' : '作答時點右上角的星號即可標記。'}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.map((q) => {
            const p = progress[q.id]
            return (
              <div key={q.id}>
                <div className="mb-1 flex items-center justify-between px-1 text-xs text-slate-400">
                  <span>
                    {p?.mistakeCount ? `答錯 ${p.mistakeCount} 次` : '已標記'}
                    {p?.lastSeen ? ` · 上次 ${fmtShort(p.lastSeen)}` : ''}
                  </span>
                  {p?.nextReview && (
                    <span className="text-amber-600">下次複習 {fmtShort(p.nextReview)}</span>
                  )}
                </div>
                <QuestionCard question={q} mode="review" flagged={!!flagged[q.id]} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
