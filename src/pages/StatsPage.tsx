import { useState, useEffect } from 'react'
import { useHabits } from '../hooks/useHabits.ts'
import { useStreaks } from '../hooks/useStreaks.ts'
import { completionService } from '../services/completionService.ts'
import { StreakDisplay } from '../components/streaks/StreakDisplay.tsx'
import { ProgressRing } from '../components/common/ProgressRing.tsx'
import { Button } from '../components/common/Button.tsx'
import { EmptyState } from '../components/common/EmptyState.tsx'
import { WeeklyReview } from '../components/stats/WeeklyReview.tsx'
import { storage } from '../services/storage.ts'
import { formatDate } from '../utils/dateUtils.ts'
import { subDays, format } from 'date-fns'
import styles from './StatsPage.module.css'

interface HabitWeekStat {
  habitId: string
  name: string
  icon: string
  color: string
  pct: number
  daysCompleted: number
  dayMap: boolean[] // Sun-Sat
}

export function StatsPage() {
  const { habits } = useHabits()
  const { getStreak } = useStreaks()
  const [weeklyStats, setWeeklyStats] = useState<{
    perfectDays: number
    totalPct: number
    habitStats: HabitWeekStat[]
    dayLabels: string[]
  }>({ perfectDays: 0, totalPct: 0, habitStats: [], dayLabels: [] })

  useEffect(() => {
    async function loadWeekly() {
      const today = new Date()
      const days: Date[] = []
      for (let i = 6; i >= 0; i--) days.push(subDays(today, i))

      const startDate = formatDate(days[0])
      const endDate = formatDate(days[6])
      const completions = await completionService.getByDateRange(startDate, endDate)
      const dailyHabits = habits.filter(h => h.frequency === 'daily')

      if (dailyHabits.length === 0) {
        setWeeklyStats({ perfectDays: 0, totalPct: 0, habitStats: [], dayLabels: [] })
        return
      }

      const dayLabels = days.map(d => format(d, 'EEE'))

      let perfectDays = 0
      let totalCompleted = 0
      const totalPossible = dailyHabits.length * 7

      const habitStats: HabitWeekStat[] = dailyHabits.map(h => {
        const dayMap = days.map(d => {
          const dateStr = formatDate(d)
          return completions.some(c => c.habitId === h.id && c.date === dateStr && c.value > 0)
        })
        const daysCompleted = dayMap.filter(Boolean).length
        totalCompleted += daysCompleted
        return {
          habitId: h.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          pct: Math.round((daysCompleted / 7) * 100),
          daysCompleted,
          dayMap,
        }
      }).sort((a, b) => b.pct - a.pct)

      for (let i = 0; i < 7; i++) {
        const dateStr = formatDate(days[i])
        const allDone = dailyHabits.every(h =>
          completions.some(c => c.habitId === h.id && c.date === dateStr && c.value > 0)
        )
        if (allDone) perfectDays++
      }

      setWeeklyStats({
        perfectDays,
        totalPct: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
        habitStats,
        dayLabels,
      })
    }

    if (habits.length > 0) loadWeekly()
  }, [habits])

  const handleExport = async () => {
    const data = await storage.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habits-export-${formatDate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (habits.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="📊"
          title="No stats yet"
          description="Create some habits and start tracking to see your stats here."
        />
      </div>
    )
  }

  const bestHabit = weeklyStats.habitStats[0]
  const worstHabit = weeklyStats.habitStats[weeklyStats.habitStats.length - 1]

  return (
    <div className={styles.page}>
      <WeeklyReview />

      {/* Weekly overview hero */}
      {weeklyStats.habitStats.length > 0 && (
        <div className={`card ${styles.weeklyHero}`}>
          <div className={styles.heroTop}>
            <div>
              <h3 className={styles.heroTitle}>This Week</h3>
              <p className={styles.heroSubtitle}>
                {weeklyStats.perfectDays}/7 perfect days
              </p>
            </div>
            <ProgressRing
              progress={weeklyStats.totalPct / 100}
              size={72}
              strokeWidth={6}
              color={weeklyStats.totalPct >= 80 ? 'var(--primary-dark)' : weeklyStats.totalPct >= 50 ? 'var(--primary)' : 'var(--accent)'}
            >
              <span className={styles.heroPct}>{weeklyStats.totalPct}%</span>
            </ProgressRing>
          </div>

          {bestHabit && (
            <div className={styles.heroHighlights}>
              <div className={styles.highlight}>
                <span className={styles.highlightLabel}>Best</span>
                <span className={styles.highlightValue}>
                  {bestHabit.icon} {bestHabit.name} ({bestHabit.pct}%)
                </span>
              </div>
              {worstHabit && worstHabit !== bestHabit && worstHabit.pct < 100 && (
                <div className={styles.highlight}>
                  <span className={styles.highlightLabel}>Focus</span>
                  <span className={styles.highlightValue}>
                    {worstHabit.icon} {worstHabit.name} ({worstHabit.pct}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Per-habit weekly breakdown */}
      {weeklyStats.habitStats.length > 0 && (
        <div className={`card ${styles.breakdownCard}`}>
          <h3 className={styles.sectionTitle}>Weekly Breakdown</h3>

          {/* Day header */}
          <div className={styles.dayHeader}>
            <span className={styles.dayHeaderLabel} />
            {weeklyStats.dayLabels.map((label, i) => (
              <span key={i} className={styles.dayLabel}>{label}</span>
            ))}
          </div>

          {/* Per-habit rows */}
          {weeklyStats.habitStats.map(stat => (
            <div key={stat.habitId} className={styles.habitRow}>
              <div className={styles.habitRowInfo}>
                <span className={styles.habitRowIcon}>{stat.icon || '○'}</span>
                <span className={styles.habitRowName}>{stat.name}</span>
              </div>
              <div className={styles.habitRowDots}>
                {stat.dayMap.map((done, i) => (
                  <span
                    key={i}
                    className={`${styles.dayDot} ${done ? styles.dayDotDone : ''}`}
                    style={done ? { background: stat.color } : undefined}
                  />
                ))}
              </div>
              <span className={styles.habitRowPct}>{stat.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Streaks per habit */}
      <div className={styles.streaksSection}>
        <h3 className={styles.sectionTitle}>Streaks</h3>
        {habits.filter(h => h.frequency !== 'quarterly' && h.frequency !== 'yearly').map(habit => {
          const weekStat = weeklyStats.habitStats.find(s => s.habitId === habit.id)
          return (
            <div key={habit.id} className="card">
              <StreakDisplay
                streak={getStreak(habit.id)}
                habit={habit}
                completionPct={weekStat?.pct}
              />
            </div>
          )
        })}
      </div>

      {/* Export */}
      <div className={styles.exportSection}>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export Data (JSON)
        </Button>
      </div>
    </div>
  )
}
