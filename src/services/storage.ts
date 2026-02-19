import { openDB, type IDBPDatabase } from 'idb'
import type { Habit } from '../models/Habit.ts'
import type { CompletionRecord } from '../models/Completion.ts'
import type { TodoItem } from '../models/Todo.ts'

const DB_NAME = 'bretts-habits'
const DB_VERSION = 2

interface HabitTrackerDB {
  habits: {
    key: string
    value: Habit
    indexes: { 'by-sortOrder': number }
  }
  completions: {
    key: string
    value: CompletionRecord
    indexes: {
      'by-habitId': string
      'by-date': string
      'by-habitId-date': [string, string]
    }
  }
  todos: {
    key: string
    value: TodoItem
    indexes: { 'by-date': string }
  }
}

let dbPromise: Promise<IDBPDatabase<HabitTrackerDB>> | null = null

function getDB(): Promise<IDBPDatabase<HabitTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HabitTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
          habitStore.createIndex('by-sortOrder', 'sortOrder')

          const completionStore = db.createObjectStore('completions', { keyPath: 'id' })
          completionStore.createIndex('by-habitId', 'habitId')
          completionStore.createIndex('by-date', 'date')
          completionStore.createIndex('by-habitId-date', ['habitId', 'date'])
        }
        if (oldVersion < 2) {
          const todoStore = db.createObjectStore('todos', { keyPath: 'id' })
          todoStore.createIndex('by-date', 'date')
        }
      },
    })
  }
  return dbPromise
}

export const storage = {
  // Habits
  async getAllHabits(): Promise<Habit[]> {
    const db = await getDB()
    return db.getAllFromIndex('habits', 'by-sortOrder')
  },

  async getHabit(id: string): Promise<Habit | undefined> {
    const db = await getDB()
    return db.get('habits', id)
  },

  async putHabit(habit: Habit): Promise<void> {
    const db = await getDB()
    await db.put('habits', habit)
  },

  async deleteHabit(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('habits', id)
  },

  // Completions
  async getCompletionsByHabit(habitId: string): Promise<CompletionRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('completions', 'by-habitId', habitId)
  },

  async getCompletionsByDate(date: string): Promise<CompletionRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('completions', 'by-date', date)
  },

  async getCompletionsByHabitAndDateRange(
    habitId: string,
    startDate: string,
    endDate: string,
  ): Promise<CompletionRecord[]> {
    const db = await getDB()
    const range = IDBKeyRange.bound([habitId, startDate], [habitId, endDate])
    return db.getAllFromIndex('completions', 'by-habitId-date', range)
  },

  async getCompletionsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<CompletionRecord[]> {
    const db = await getDB()
    const range = IDBKeyRange.bound(startDate, endDate)
    return db.getAllFromIndex('completions', 'by-date', range)
  },

  async putCompletion(completion: CompletionRecord): Promise<void> {
    const db = await getDB()
    await db.put('completions', completion)
  },

  async deleteCompletion(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('completions', id)
  },

  async deleteCompletionsByHabit(habitId: string): Promise<void> {
    const db = await getDB()
    const completions = await db.getAllFromIndex('completions', 'by-habitId', habitId)
    const tx = db.transaction('completions', 'readwrite')
    for (const c of completions) {
      tx.store.delete(c.id)
    }
    await tx.done
  },

  // Todos
  async getTodosByDate(date: string): Promise<TodoItem[]> {
    const db = await getDB()
    return db.getAllFromIndex('todos', 'by-date', date)
  },

  async putTodo(todo: TodoItem): Promise<void> {
    const db = await getDB()
    await db.put('todos', todo)
  },

  async deleteTodo(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('todos', id)
  },

  // Export all data as JSON
  async exportData(): Promise<string> {
    const db = await getDB()
    const habits = await db.getAll('habits')
    const completions = await db.getAll('completions')
    return JSON.stringify({ habits, completions, exportedAt: new Date().toISOString() }, null, 2)
  },
}
