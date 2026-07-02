import { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useStore } from './store/useStore'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import MockExam from './pages/MockExam'
import Notebook from './pages/Notebook'
import Search from './pages/Search'
import ParentView from './pages/ParentView'
import ImportPage from './pages/ImportPage'
import Settings from './pages/Settings'
import More from './pages/More'

const NAV = [
  { to: '/', label: '首頁', icon: '🏠', end: true },
  { to: '/practice', label: '練習', icon: '✏️' },
  { to: '/mock', label: '模擬考', icon: '📝' },
  { to: '/notebook', label: '錯題本', icon: '📒' },
  { to: '/more', label: '更多', icon: '⋯' },
]

export default function App() {
  const seedIfEmpty = useStore((s) => s.seedIfEmpty)
  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-24 pt-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/mock" element={<MockExam />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/search" element={<Search />} />
          <Route path="/parent" element={<ParentView />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/more" element={<More />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
                  isActive ? 'text-brand-700' : 'text-slate-400'
                }`
              }
            >
              <span className="text-xl leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
