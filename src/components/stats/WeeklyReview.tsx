import { useState, useEffect } from 'react'
import { useHabits } from '../../hooks/useHabits.ts'
import { completionService } from '../../services/completionService.ts'
import { useStreaks } from '../../hooks/useStreaks.ts'
import { formatDate } from '../../utils/dateUtils.ts'
import { subDays, format, startOfWeek, endOfWeek } from 'date-fns'
import type { CompletionRecord } from '../../models/Completion.ts'
import styles from './WeeklyReview.module.css'

interface WeekData {
  totalPct: number
  habitPcts: { habitId: string; name: string; icon: string; pct: number }[]
  notes: { habitName: string; icon: string; note: string; date: string }[]
}

function computeWeekData(
  habits: { id: string; name: string; icon: string; frequency: string }[],
  completions: CompletionRecord[],
  days: Date[],
): WeekData {
  const dailyHabits = habits.filter(h => h.frequency === 'daily')
  if (dailyHabits.length === 0) return { totalPct: 0, habitPcts: [], notes: [] }

  let totalCompleted = 0
  const totalPossible = dailyHabits.length * 7

  const habitPcts = dailyHabits.map(h => {
    const daysCompleted = days.filter(d => {
      const dateStr = formatDate(d)
      return completions.some(c => c.habitId === h.id && c.date === dateStr && c.value > 0)
    }).length
    totalCompleted += daysCompleted
    return {
      habitId: h.id,
      name: h.name,
      icon: h.icon,
      pct: Math.round((daysCompleted / 7) * 100),
    }
  }).sort((a, b) => b.pct - a.pct)

  const notes: WeekData['notes'] = []
  for (const c of completions) {
    if (c.note) {
      const habit = habits.find(h => h.id === c.habitId)
      if (habit) {
        notes.push({ habitName: habit.name, icon: habit.icon, note: c.note, date: c.date })
      }
    }
  }

  return {
    totalPct: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
    habitPcts,
    notes,
  }
}

export function WeeklyReview() {
  const { habits } = useHabits()
  const { getStreak } = useStreaks()
  const [expanded, setExpanded] = useState(true)
  const [thisWeek, setThisWeek] = useState<WeekData | null>(null)
  const [lastWeek, setLastWeek] = useState<WeekData | null>(null)
  const [weekRange, setWeekRange] = useState('')

  useEffect(() => {
    async function load() {
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
      setWeekRange(`${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`)

      // This week
      const thisDays: Date[] = []
      for (let i = 6; i >= 0; i--) thisDays.push(subDays(today, i))
      const thisCompletions = await completionService.getByDateRange(
        formatDate(thisDays[0]),
        formatDate(thisDays[6]),
      )
      setThisWeek(computeWeekData(habits, thisCompletions, thisDays))

      // Last week
      const lastStart = subDays(thisDays[0], 7)
      const lastDays: Date[] = []
      for (let i = 0; i < 7; i++) lastDays.push(subDays(lastStart, -i))
      const lastCompletions = await completionService.getByDateRange(
        formatDate(lastDays[0]),
        formatDate(lastDays[6]),
      )
      setLastWeek(computeWeekData(habits, lastCompletions, lastDays))
    }

    if (habits.length > 0) load()
  }, [habits])

  if (!thisWeek || thisWeek.habitPcts.length === 0) return null

  const trend = lastWeek ? thisWeek.totalPct - lastWeek.totalPct : 0
  const starHabit = thisWeek.habitPcts[0]
  const needsAttention = thisWeek.habitPcts.filter(h => h.pct < 50)

  // Find best streak among daily habits
  let bestStreak = { name: '', icon: '', streak: 0 }
  for (const h of habits.filter(h => h.frequency === 'daily')) {
    const s = getStreak(h.id)
    if (s.currentStreak > bestStreak.streak) {
      bestStreak = { name: h.name, icon: h.icon, streak: s.currentStreak }
    }
  }

  const narrativeMsg = thisWeek.totalPct >= 80
    ? `Great week! You completed ${thisWeek.totalPct}% of your habits.`
    : thisWeek.totalPct >= 50
    ? `Solid effort this week with ${thisWeek.totalPct}% completion.`
    : `Room to grow - you hit ${thisWeek.totalPct}% this week.`

  return (
    <div className={styles.card}>
      <div className={styles.headerRow} onClick={() => setExpanded(!expanded)}>
        <div>
          <h3 className={styles.title}>Weekly Review</h3>
          <span className={styles.dateRange}>{weekRange}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.overallPct}>{thisWeek.totalPct}%</span>
          <span className={styles.chevron}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          {/* Trend */}
          {lastWeek && (
            <div className={styles.trend}>
              <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
                {trend >= 0 ? '+' : ''}{trend}% vs last week
              </span>
            </div>
          )}

          {/* Narrative */}
          <p className={styles.narrative}>
            {narrativeMsg}
            {bestStreak.streak > 2 && (
              <> {bestStreak.icon} {bestStreak.name} is on a {bestStreak.streak}-day streak!</>
            )}
          </p>

          {/* Star habit */}
          {starHabit && (
            <div className={styles.starSection}>
              <span className={styles.label}>Star Habit</span>
              <span className={styles.starValue}>
                {starHabit.icon} {starHabit.name} ({starHabit.pct}%)
              </span>
            </div>
          )}

          {/* Needs attention */}
          {needsAttention.length > 0 && (
            <div className={styles.attentionSection}>
              <span className={styles.label}>Needs Attention</span>
              {needsAttention.map(h => (
                <span key={h.habitId} className={styles.attentionItem}>
                  {h.icon} {h.name} ({h.pct}%)
                </span>
              ))}
            </div>
          )}

          {/* Notes this week */}
          {thisWeek.notes.length > 0 && (
            <div className={styles.notesSection}>
              <span className={styles.label}>Notes This Week</span>
              {thisWeek.notes.map((n, i) => (
                <div key={i} className={styles.noteItem}>
                  <span className={styles.noteHabit}>{n.icon} {n.habitName}</span>
                  <span className={styles.noteText}>{n.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
