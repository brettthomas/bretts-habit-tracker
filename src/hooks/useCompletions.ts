import { useMemo } from 'react'
import { useHabitContext } from '../context/HabitContext.tsx'

export function useCompletions() {
  const { state, toggleCompletion, logCompletion, addNote } = useHabitContext()

  const completionMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of state.todayCompletions) {
      map.set(c.habitId, c.value)
    }
    return map
  }, [state.todayCompletions])

  const noteMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of state.todayCompletions) {
      if (c.note) map.set(c.habitId, c.note)
    }
    return map
  }, [state.todayCompletions])

  const isCompleted = (habitId: string): boolean => {
    return (completionMap.get(habitId) ?? 0) > 0
  }

  const getValue = (habitId: string): number => {
    return completionMap.get(habitId) ?? 0
  }

  const getNote = (habitId: string): string | undefined => {
    return noteMap.get(habitId)
  }

  const allDailyComplete = useMemo(() => {
    const dailyHabits = state.habits.filter(h => h.frequency === 'daily')
    if (dailyHabits.length === 0) return false
    return dailyHabits.every(h => isCompleted(h.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.habits, state.todayCompletions])

  return {
    completions: state.todayCompletions,
    completionMap,
    noteMap,
    isCompleted,
    getValue,
    getNote,
    toggleCompletion,
    logCompletion,
    addNote,
    allDailyComplete,
  }
}
