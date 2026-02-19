import { useHabitContext } from '../context/HabitContext.tsx'
import type { StreakInfo } from '../models/Streak.ts'

export function useStreaks() {
  const { state } = useHabitContext()

  const getStreak = (habitId: string): StreakInfo => {
    return state.streaks.get(habitId) ?? {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakStartDate: null,
      longestStreakStart: null,
      longestStreakEnd: null,
    }
  }

  const getBestOverallStreak = (): { habitId: string; streak: StreakInfo } | null => {
    let best: { habitId: string; streak: StreakInfo } | null = null
    for (const [habitId, streak] of state.streaks) {
      if (!best || streak.currentStreak > best.streak.currentStreak) {
        best = { habitId, streak }
      }
    }
    return best
  }

  return {
    streaks: state.streaks,
    getStreak,
    getBestOverallStreak,
  }
}
