import type { CompletionRecord } from '../models/Completion.ts'
import type { Habit } from '../models/Habit.ts'
import type { StreakInfo } from '../models/Streak.ts'
import { formatDate, getPeriodStart, getPreviousPeriodStart } from './dateUtils.ts'
import { isTimeOnTarget } from './timeUtils.ts'

function isCompletedInPeriod(
  completions: CompletionRecord[],
  periodStart: Date,
  habit: Habit,
): boolean {
  const periodKey = formatDate(periodStart)
  const periodCompletions = completions.filter(c => {
    const cPeriodStart = formatDate(getPeriodStart(new Date(c.date), habit.frequency))
    return cPeriodStart === periodKey
  })

  if (periodCompletions.length === 0) return false

  if (habit.trackingType === 'checkbox') {
    return periodCompletions.some(c => c.value > 0)
  }

  if (habit.trackingType === 'time') {
    return periodCompletions.some(c => isTimeOnTarget(c.value, habit.goal.targetValue))
  }

  const totalValue = periodCompletions.reduce((sum, c) => sum + c.value, 0)
  return totalValue >= habit.goal.targetValue
}

export function calculateStreak(habit: Habit, completions: CompletionRecord[]): StreakInfo {
  if (completions.length === 0) {
    return {
      habitId: habit.id,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakStartDate: null,
      longestStreakStart: null,
      longestStreakEnd: null,
    }
  }

  const sorted = [...completions].sort((a, b) => b.date.localeCompare(a.date))
  const lastCompletedDate = sorted[0].date

  // Walk backwards from today counting consecutive completed periods
  let currentStreak = 0
  let streakStartDate: string | null = null
  let checkDate = new Date()

  // Check if today's period is completed; if not, start from previous period
  let periodStart = getPeriodStart(checkDate, habit.frequency)
  if (!isCompletedInPeriod(completions, periodStart, habit)) {
    checkDate = getPreviousPeriodStart(checkDate, habit.frequency)
    periodStart = getPeriodStart(checkDate, habit.frequency)
  }

  while (isCompletedInPeriod(completions, periodStart, habit)) {
    currentStreak++
    streakStartDate = formatDate(periodStart)
    checkDate = getPreviousPeriodStart(checkDate, habit.frequency)
    periodStart = getPeriodStart(checkDate, habit.frequency)
  }

  // Find longest streak by scanning all completions
  let longestStreak = 0
  let longestStreakStart: string | null = null
  let longestStreakEnd: string | null = null

  // Get unique period starts from completions
  const periodStarts = new Map<string, Date>()
  for (const c of completions) {
    const ps = getPeriodStart(new Date(c.date), habit.frequency)
    periodStarts.set(formatDate(ps), ps)
  }

  const sortedPeriods = [...periodStarts.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  let tempStreak = 0
  let tempStart: string | null = null

  for (const [periodKey, periodDate] of sortedPeriods) {
    if (isCompletedInPeriod(completions, periodDate, habit)) {
      if (tempStreak === 0) tempStart = periodKey
      tempStreak++

      // Check if the next period also has completions (consecutive check)
      const nextPeriodStart = getPeriodStart(
        new Date(periodDate.getTime() + (habit.frequency === 'daily' ? 86400000 : 0)),
        habit.frequency,
      )
      const nextKey = formatDate(nextPeriodStart)
      const isNextPeriod = nextKey !== periodKey

      if (isNextPeriod && !periodStarts.has(nextKey)) {
        // Streak broken
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
          longestStreakStart = tempStart
          longestStreakEnd = periodKey
        }
        tempStreak = 0
        tempStart = null
      }
    }
  }

  // Final check
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
    longestStreakStart = tempStart
    longestStreakEnd = sortedPeriods[sortedPeriods.length - 1]?.[0] ?? null
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
    longestStreakStart = streakStartDate
    longestStreakEnd = formatDate(new Date())
  }

  return {
    habitId: habit.id,
    currentStreak,
    longestStreak,
    lastCompletedDate,
    streakStartDate,
    longestStreakStart,
    longestStreakEnd,
  }
}

export function getMotivationalMessage(streak: StreakInfo): string {
  const { currentStreak, longestStreak } = streak

  if (currentStreak === 0) {
    return "Today's a great day to start fresh!"
  }

  const daysToRecord = longestStreak - currentStreak

  if (daysToRecord === 0 && currentStreak > 1) {
    return `You just tied your personal best of ${longestStreak}! Keep going!`
  }

  if (currentStreak > longestStreak) {
    return `New personal best: ${currentStreak} days! You're unstoppable!`
  }

  if (daysToRecord <= 3 && daysToRecord > 0) {
    return `Only ${daysToRecord} day${daysToRecord === 1 ? '' : 's'} to beat your record!`
  }

  if (currentStreak >= 30) {
    return `${currentStreak} days strong! What an incredible commitment!`
  }

  if (currentStreak >= 7) {
    return `${currentStreak}-day streak! You're building something amazing!`
  }

  return `${currentStreak}-day streak! Keep the momentum going!`
}
