import type { Category, Question } from '../types'

const VALID: Category[] = ['signs', 'rules', 'situational', 'hazard']

export interface ImportResult {
  ok: boolean
  questions: Question[]
  errors: string[]
  count: number
}

/**
 * Parse and validate a questions.json payload.
 * Accepts either a raw array or an object with a `questions` array.
 */
export function parseQuestions(raw: string): ImportResult {
  const errors: string[] = []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return { ok: false, questions: [], errors: [`JSON 格式錯誤：${(e as Error).message}`], count: 0 }
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as { questions?: unknown }).questions)
      ? (data as { questions: unknown[] }).questions
      : null

  if (!list) {
    return { ok: false, questions: [], errors: ['檔案必須是題目陣列，或含有 "questions" 陣列的物件。'], count: 0 }
  }

  const questions: Question[] = []
  const seenIds = new Set<string>()

  list.forEach((item, i) => {
    const q = item as Partial<Question>
    const where = `第 ${i + 1} 題`
    if (!q || typeof q !== 'object') {
      errors.push(`${where}：不是有效的物件`)
      return
    }
    if (!q.question || typeof q.question !== 'string') {
      errors.push(`${where}：缺少 question 題目文字`)
      return
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${where}：options 至少需要 2 個選項`)
      return
    }
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
      errors.push(`${where}：answer 必須是 options 的有效索引（0 起算）`)
      return
    }
    const category = (VALID.includes(q.category as Category) ? q.category : 'rules') as Category
    let id = typeof q.id === 'string' && q.id ? q.id : `q-${i + 1}`
    while (seenIds.has(id)) id = `${id}-${i + 1}`
    seenIds.add(id)

    questions.push({
      id,
      category,
      topic: typeof q.topic === 'string' ? q.topic : '',
      question: q.question,
      options: q.options.map((o) => String(o)),
      answer: q.answer,
      explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
      source: typeof q.source === 'string' ? q.source : undefined,
      image: typeof q.image === 'string' ? q.image : undefined,
      video: typeof q.video === 'string' ? q.video : undefined,
      optionImages: Array.isArray(q.optionImages) ? q.optionImages.map((o) => String(o)) : undefined,
      pendingRender: q.pendingRender === true ? true : undefined,
    })
  })

  return { ok: questions.length > 0, questions, errors, count: questions.length }
}
