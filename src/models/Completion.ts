export interface CompletionRecord {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  value: number
  completedAt: string // ISO timestamp
  note?: string
}
