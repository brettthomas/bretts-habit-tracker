export interface StreakInfo {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
  streakStartDate: string | null
  longestStreakStart: string | null
  longestStreakEnd: string | null
}
