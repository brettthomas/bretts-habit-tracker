import { storage } from './storage.ts'
import type { CompletionRecord } from '../models/Completion.ts'

function generateId(): string {
  return crypto.randomUUID()
}

export const completionService = {
  async getByDate(date: string): Promise<CompletionRecord[]> {
    return storage.getCompletionsByDate(date)
  },

  async getByHabit(habitId: string): Promise<CompletionRecord[]> {
    return storage.getCompletionsByHabit(habitId)
  },

  async getByHabitAndDateRange(
    habitId: string,
    startDate: string,
    endDate: string,
  ): Promise<CompletionRecord[]> {
    return storage.getCompletionsByHabitAndDateRange(habitId, startDate, endDate)
  },

  async getByDateRange(startDate: string, endDate: string): Promise<CompletionRecord[]> {
    return storage.getCompletionsByDateRange(startDate, endDate)
  },

  async logCompletion(habitId: string, date: string, value: number, note?: string): Promise<CompletionRecord> {
    const existing = await storage.getCompletionsByHabitAndDateRange(habitId, date, date)
    const existingRecord = existing[0]

    if (existingRecord) {
      const updated: CompletionRecord = {
        ...existingRecord,
        value,
        completedAt: new Date().toISOString(),
        note: note ?? existingRecord.note,
      }
      await storage.putCompletion(updated)
      return updated
    }

    const record: CompletionRecord = {
      id: generateId(),
      habitId,
      date,
      value,
      completedAt: new Date().toISOString(),
      note,
    }
    await storage.putCompletion(record)
    return record
  },

  async toggleCompletion(habitId: string, date: string): Promise<CompletionRecord | null> {
    const existing = await storage.getCompletionsByHabitAndDateRange(habitId, date, date)
    const existingRecord = existing[0]

    if (existingRecord && existingRecord.value > 0) {
      await storage.deleteCompletion(existingRecord.id)
      return null
    }

    return this.logCompletion(habitId, date, 1)
  },

  async removeCompletion(habitId: string, date: string): Promise<void> {
    const existing = await storage.getCompletionsByHabitAndDateRange(habitId, date, date)
    for (const record of existing) {
      await storage.deleteCompletion(record.id)
    }
  },
}
