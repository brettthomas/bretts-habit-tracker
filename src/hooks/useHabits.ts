import { useMemo } from 'react'
import { useHabitContext } from '../context/HabitContext.tsx'

export function useHabits() {
  const { state, createHabit, updateHabit, archiveHabit, deleteHabit, reorderHabits } = useHabitContext()

  const dailyHabits = useMemo(
    () => state.habits.filter(h => h.frequency === 'daily'),
    [state.habits],
  )

  const nonDailyHabits = useMemo(
    () => state.habits.filter(h => h.frequency !== 'daily'),
    [state.habits],
  )

  return {
    habits: state.habits,
    dailyHabits,
    nonDailyHabits,
    loading: state.loading,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    reorderHabits,
  }
}
