import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PageHeader } from '../components/ui'

const ITEMS = [
  { to: '/search', icon: '🔍', label: '搜尋題庫', desc: '用關鍵字找題目' },
  { to: '/parent', icon: '👨‍👩‍👧', label: '家長檢視', desc: '整體進度與弱點分析' },
  { to: '/import', icon: '📥', label: '匯入題庫', desc: '載入 questions.json' },
  { to: '/settings', icon: '⚙️', label: '設定', desc: '考試日期、每日目標、資料' },
]

export default function More() {
  const count = useStore((s) => s.questions.length)
  return (
    <div className="space-y-4">
      <PageHeader title="更多" subtitle={`題庫共 ${count} 題`} />
      <div className="space-y-2.5">
        {ITEMS.map((it) => (
          <Link key={it.to} to={it.to} className="card flex items-center gap-3 p-4 active:scale-[0.99]">
            <span className="text-2xl">{it.icon}</span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-800">{it.label}</span>
              <span className="block text-xs text-slate-400">{it.desc}</span>
            </span>
            <span className="text-slate-300">›</span>
          </Link>
        ))}
      </div>
      <p className="px-1 pt-2 text-xs text-slate-400">
        汽車駕照筆試通 · 2026 新制 · 資料僅存於本機，無需登入。
      </p>
    </div>
  )
}
