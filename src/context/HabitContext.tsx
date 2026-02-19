import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { Habit, HabitFormData } from '../models/Habit.ts'
import type { CompletionRecord } from '../models/Completion.ts'
import type { StreakInfo } from '../models/Streak.ts'
import { habitService } from '../services/habitService.ts'
import { completionService } from '../services/completionService.ts'
import { streakService } from '../services/streakService.ts'
import { today } from '../utils/dateUtils.ts'

interface State {
  habits: Habit[]
  todayCompletions: CompletionRecord[]
  streaks: Map<string, StreakInfo>
  loading: boolean
  currentDate: string
}

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'REMOVE_HABIT'; id: string }
  | { type: 'SET_TODAY_COMPLETIONS'; completions: CompletionRecord[] }
  | { type: 'UPSERT_COMPLETION'; completion: CompletionRecord }
  | { type: 'REMOVE_COMPLETION'; habitId: string }
  | { type: 'SET_STREAKS'; streaks: Map<string, StreakInfo> }
  | { type: 'SET_DATE'; date: string }
  | { type: 'REORDER_HABITS'; habitIds: string[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_HABITS':
      return { ...state, habits: action.habits }
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.habit.id ? action.habit : h),
      }
    case 'REMOVE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.id),
      }
    case 'SET_TODAY_COMPLETIONS':
      return { ...state, todayCompletions: action.completions }
    case 'UPSERT_COMPLETION': {
      const existing = state.todayCompletions.findIndex(
        c => c.habitId === action.completion.habitId && c.date === action.completion.date,
      )
      const completions = [...state.todayCompletions]
      if (existing >= 0) {
        completions[existing] = action.completion
      } else {
        completions.push(action.completion)
      }
      return { ...state, todayCompletions: completions }
    }
    case 'REMOVE_COMPLETION':
      return {
        ...state,
        todayCompletions: state.todayCompletions.filter(c => c.habitId !== action.habitId),
      }
    case 'SET_STREAKS':
      return { ...state, streaks: action.streaks }
    case 'SET_DATE':
      return { ...state, currentDate: action.date }
    case 'REORDER_HABITS': {
      const orderMap = new Map(action.habitIds.map((id, i) => [id, i]))
      const reordered = [...state.habits].sort((a, b) => {
        const aIdx = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const bIdx = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return aIdx - bIdx
      })
      return { ...state, habits: reordered }
    }
    default:
      return state
  }
}

interface HabitContextValue {
  state: State
  createHabit: (data: HabitFormData) => Promise<Habit>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (habitId: string) => Promise<void>
  logCompletion: (habitId: string, value: number, note?: string) => Promise<void>
  addNote: (habitId: string, note: string) => Promise<void>
  reorderHabits: (habitIds: string[]) => Promise<void>
  refreshData: () => Promise<void>
}

const HabitContext = createContext<HabitContextValue | null>(null)

const initialState: State = {
  habits: [],
  todayCompletions: [],
  streaks: new Map(),
  loading: true,
  currentDate: today(),
}

export function HabitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const [habits, completions, streaks] = await Promise.all([
        habitService.getAll(),
        completionService.getByDate(today()),
        streakService.getAllStreaks(),
      ])
      dispatch({ type: 'SET_HABITS', habits })
      dispatch({ type: 'SET_TODAY_COMPLETIONS', completions })
      dispatch({ type: 'SET_STREAKS', streaks })
      dispatch({ type: 'SET_DATE', date: today() })
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Handle date rollover
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const currentDate = today()
        if (currentDate !== state.currentDate) {
          refreshData()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [state.currentDate, refreshData])

  const createHabit = useCallback(async (data: HabitFormData) => {
    const habit = await habitService.create(data)
    dispatch({ type: 'ADD_HABIT', habit })
    return habit
  }, [])

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const habit = await habitService.update(id, updates)
    dispatch({ type: 'UPDATE_HABIT', habit })
  }, [])

  const archiveHabit = useCallback(async (id: string) => {
    await habitService.archive(id)
    dispatch({ type: 'REMOVE_HABIT', id })
  }, [])

  const deleteHabit = useCallback(async (id: string) => {
    await habitService.delete(id)
    dispatch({ type: 'REMOVE_HABIT', id })
  }, [])

  const toggleCompletion = useCallback(async (habitId: string) => {
    const result = await completionService.toggleCompletion(habitId, today())
    if (result) {
      dispatch({ type: 'UPSERT_COMPLETION', completion: result })
    } else {
      dispatch({ type: 'REMOVE_COMPLETION', habitId })
    }
    // Refresh streaks
    const streaks = await streakService.getAllStreaks()
    dispatch({ type: 'SET_STREAKS', streaks })
  }, [])

  const logCompletion = useCallback(async (habitId: string, value: number, note?: string) => {
    const result = await completionService.logCompletion(habitId, today(), value, note)
    dispatch({ type: 'UPSERT_COMPLETION', completion: result })
    const streaks = await streakService.getAllStreaks()
    dispatch({ type: 'SET_STREAKS', streaks })
  }, [])

  const addNote = useCallback(async (habitId: string, note: string) => {
    const existing = state.todayCompletions.find(c => c.habitId === habitId)
    if (!existing) return
    const result = await completionService.logCompletion(habitId, today(), existing.value, note)
    dispatch({ type: 'UPSERT_COMPLETION', completion: result })
  }, [state.todayCompletions])

  const reorderHabits = useCallback(async (habitIds: string[]) => {
    await habitService.reorder(habitIds)
    dispatch({ type: 'REORDER_HABITS', habitIds })
  }, [])

  return (
    <HabitContext.Provider value={{
      state,
      createHabit,
      updateHabit,
      archiveHabit,
      deleteHabit,
      toggleCompletion,
      logCompletion,
      addNote,
      reorderHabits,
      refreshData,
    }}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabitContext(): HabitContextValue {
  const ctx = useContext(HabitContext)
  if (!ctx) throw new Error('useHabitContext must be used within HabitProvider')
  return ctx
}
