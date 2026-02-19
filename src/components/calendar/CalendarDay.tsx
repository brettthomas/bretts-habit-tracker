import { formatDate, isToday } from '../../utils/dateUtils.ts'
import type { CompletionRecord } from '../../models/Completion.ts'
import type { Habit } from '../../models/Habit.ts'
import styles from './CalendarDay.module.css'

interface CalendarDayProps {
  date: Date | null
  completions: CompletionRecord[]
  habits: Habit[]
  selected: boolean
  onSelect: (date: string) => void
}

export function CalendarDay({ date, completions, habits, selected, onSelect }: CalendarDayProps) {
  if (!date) {
    return <div className={styles.empty} />
  }

  const dateStr = formatDate(date)
  const isTodayDate = isToday(dateStr)
  const isFuture = date > new Date()

  // Calculate completion ratio for heat-map intensity
  const activeHabits = habits.filter(h => !h.archived && h.trackingType !== 'water')
  const completedCount = new Set(
    completions.filter(c => c.value > 0).map(c => c.habitId)
  ).size
  const ratio = activeHabits.length > 0 ? completedCount / activeHabits.length : 0

  // Collect habit colors for dots
  const habitColors: string[] = []
  for (const completion of completions) {
    const habit = habits.find(h => h.id === completion.habitId)
    if (habit && completion.value > 0 && !habitColors.includes(habit.color)) {
      habitColors.push(habit.color)
    }
  }
  const dots = habitColors.slice(0, 4)
  const allComplete = ratio >= 1 && activeHabits.length > 0

  return (
    <button
      className={[
        styles.day,
        isTodayDate ? styles.today : '',
        selected ? styles.selected : '',
        isFuture ? styles.future : '',
        allComplete ? styles.perfect : '',
      ].filter(Boolean).join(' ')}
      onClick={() => !isFuture && onSelect(dateStr)}
      disabled={isFuture}
      style={ratio > 0 && !allComplete ? {
        '--fill-opacity': `${Math.max(0.08, ratio * 0.3)}`,
      } as React.CSSProperties : undefined}
    >
      <span className={styles.number}>{date.getDate()}</span>
      {dots.length > 0 && (
        <div className={styles.dots}>
          {dots.map((color, i) => (
            <span key={i} className={styles.dot} style={{ background: color }} />
          ))}
        </div>
      )}
    </button>
  )
}
