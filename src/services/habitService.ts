import { storage } from './storage.ts'
import type { Habit, HabitFormData } from '../models/Habit.ts'

function generateId(): string {
  return crypto.randomUUID()
}

export const habitService = {
  async getAll(): Promise<Habit[]> {
    const habits = await storage.getAllHabits()
    return habits.filter(h => !h.archived)
  },

  async getAllIncludingArchived(): Promise<Habit[]> {
    return storage.getAllHabits()
  },

  async getById(id: string): Promise<Habit | undefined> {
    return storage.getHabit(id)
  },

  async create(data: HabitFormData): Promise<Habit> {
    const allHabits = await storage.getAllHabits()
    const maxOrder = allHabits.reduce((max, h) => Math.max(max, h.sortOrder), -1)

    const habit: Habit = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      sortOrder: maxOrder + 1,
    }

    await storage.putHabit(habit)
    return habit
  },

  async update(id: string, updates: Partial<Habit>): Promise<Habit> {
    const existing = await storage.getHabit(id)
    if (!existing) throw new Error(`Habit ${id} not found`)

    const updated = { ...existing, ...updates, id }
    await storage.putHabit(updated)
    return updated
  },

  async archive(id: string): Promise<void> {
    const existing = await storage.getHabit(id)
    if (!existing) throw new Error(`Habit ${id} not found`)
    await storage.putHabit({ ...existing, archived: true })
  },

  async delete(id: string): Promise<void> {
    await storage.deleteCompletionsByHabit(id)
    await storage.deleteHabit(id)
  },

  async reorder(habitIds: string[]): Promise<void> {
    for (let i = 0; i < habitIds.length; i++) {
      const habit = await storage.getHabit(habitIds[i])
      if (habit) {
        await storage.putHabit({ ...habit, sortOrder: i })
      }
    }
  },
}
