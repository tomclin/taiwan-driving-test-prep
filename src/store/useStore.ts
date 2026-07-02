import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockResult, Progress, Question, Settings } from '../types'
import { newProgress, scheduleAfterAnswer } from '../lib/srs'
import { todayKey } from '../lib/date'
import sample from '../data/sampleQuestions.json'

// Bump when the bundled seed bank changes so existing installs pick it up
// (progress is keyed separately by question id and is preserved).
const SEED_VERSION = 13

/** Drop items that can't yet be answered/rendered (e.g. image-option UI pending). */
const liveOnly = (qs: Question[]) => qs.filter((q) => !q.pendingRender)

interface StoreState {
  questions: Question[]
  progress: Record<string, Progress>
  mockResults: MockResult[]
  flagged: Record<string, boolean>
  dailyCounts: Record<string, number>
  settings: Settings
  /** True once questions.json / seed data has been loaded at least once. */
  seeded: boolean
  /** Seed bank version currently loaded; triggers a refresh when SEED_VERSION changes. */
  seedVersion: number
  /** True once the user has imported their own bank (suppresses seed auto-refresh). */
  custom: boolean

  seedIfEmpty: () => void
  setQuestions: (qs: Question[], mode: 'replace' | 'merge') => void
  recordAnswer: (id: string, correct: boolean, confident?: boolean) => void
  toggleFlag: (id: string) => void
  addMockResult: (r: MockResult) => void
  updateSettings: (s: Partial<Settings>) => void
  resetProgress: () => void
  resetAll: () => void
}

const DEFAULT_SETTINGS: Settings = {
  examDate: null,
  dailyTarget: 30,
  passPct: 85,
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      questions: [],
      progress: {},
      mockResults: [],
      flagged: {},
      dailyCounts: {},
      settings: DEFAULT_SETTINGS,
      seeded: false,
      seedVersion: 0,
      custom: false,

      seedIfEmpty: () => {
        const s = get()
        // Seed on first run, or refresh the built-in bank when its version bumps —
        // but never clobber a bank the user imported themselves.
        if (s.questions.length === 0 || (!s.custom && s.seedVersion !== SEED_VERSION)) {
          set({ questions: liveOnly(sample as Question[]), seeded: true, seedVersion: SEED_VERSION })
        } else {
          set({ seeded: true })
        }
      },

      setQuestions: (qs, mode) =>
        set((state) => {
          const clean = liveOnly(qs)
          if (mode === 'replace') return { questions: clean, seeded: true, custom: true }
          const byId = new Map(state.questions.map((q) => [q.id, q]))
          for (const q of clean) byId.set(q.id, q)
          return { questions: [...byId.values()], seeded: true, custom: true }
        }),

      recordAnswer: (id, correct, confident = false) =>
        set((state) => {
          const prev = state.progress[id] ?? newProgress(id)
          const next = scheduleAfterAnswer(prev, correct, confident)
          const key = todayKey()
          return {
            progress: { ...state.progress, [id]: next },
            dailyCounts: { ...state.dailyCounts, [key]: (state.dailyCounts[key] ?? 0) + 1 },
          }
        }),

      toggleFlag: (id) =>
        set((state) => {
          const flagged = { ...state.flagged }
          if (flagged[id]) delete flagged[id]
          else flagged[id] = true
          return { flagged }
        }),

      addMockResult: (r) => set((state) => ({ mockResults: [r, ...state.mockResults].slice(0, 50) })),

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      resetProgress: () =>
        set({ progress: {}, mockResults: [], flagged: {}, dailyCounts: {} }),

      resetAll: () =>
        set({
          questions: [],
          progress: {},
          mockResults: [],
          flagged: {},
          dailyCounts: {},
          settings: DEFAULT_SETTINGS,
          seeded: false,
          seedVersion: 0,
          custom: false,
        }),
    }),
    {
      name: 'twdt-store-v1',
      partialize: (s) => ({
        questions: s.questions,
        progress: s.progress,
        mockResults: s.mockResults,
        flagged: s.flagged,
        dailyCounts: s.dailyCounts,
        settings: s.settings,
        seeded: s.seeded,
        seedVersion: s.seedVersion,
        custom: s.custom,
      }),
    },
  ),
)
