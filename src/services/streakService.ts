import { completionService } from './completionService.ts'
import { habitService } from './habitService.ts'
import { calculateStreak } from '../utils/streakCalculator.ts'
import type { StreakInfo } from '../models/Streak.ts'

export const streakService = {
  async getStreakForHabit(habitId: string): Promise<StreakInfo> {
    const habit = await habitService.getById(habitId)
    if (!habit) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        streakStartDate: null,
        longestStreakStart: null,
        longestStreakEnd: null,
      }
    }

    const completions = await completionService.getByHabit(habitId)
    return calculateStreak(habit, completions)
  },

  async getAllStreaks(): Promise<Map<string, StreakInfo>> {
    const habits = await habitService.getAll()
    const streaks = new Map<string, StreakInfo>()

    for (const habit of habits) {
      const completions = await completionService.getByHabit(habit.id)
      streaks.set(habit.id, calculateStreak(habit, completions))
    }

    return streaks
  },
}
