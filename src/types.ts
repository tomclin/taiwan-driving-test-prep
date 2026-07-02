export type Category = 'signs' | 'rules' | 'situational' | 'hazard'

/** Static question — matches the questions.json import format. */
export interface Question {
  id: string
  category: Category
  topic: string
  question: string
  options: string[]
  /** Index into `options` of the correct answer. */
  answer: number
  explanation?: string
  source?: string
  image?: string
  video?: string
  /** For image-option questions: one sign image per option (parallel to `options`). */
  optionImages?: string[]
  /** True while an item can't yet be rendered (e.g. image-option UI pending) → excluded from the live bank. */
  pendingRender?: boolean
}

/** Per-question learning progress, stored locally (never in questions.json). */
export interface Progress {
  id: string
  mistakeCount: number
  correctCount: number
  /** 0 = unknown / wrong, 1 = got it, 2 = confident. */
  confidence: number
  lastSeen: number | null
  /** Epoch ms when this question is next due for spaced-repetition review. */
  nextReview: number | null
  /** Spaced-repetition stage: 0 (same day) → 1 (+1d) → 2 (+3d) → 3 (+7d) → graduated. */
  srsStage: number
}

export interface MockResult {
  id: string
  date: number
  total: number
  correct: number
  scorePct: number
  passed: boolean
  wrongIds: string[]
  uncertainIds: string[]
  durationSec: number
}

export interface Settings {
  /** ISO date string (yyyy-mm-dd) of the exam, or null if unset. */
  examDate: string | null
  dailyTarget: number
  /** Pass threshold as a percentage. Official car test ≈ 85 (43/50). */
  passPct: number
}
