export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string // ISO timestamp
  date: string // YYYY-MM-DD — the day this to-do belongs to
}
