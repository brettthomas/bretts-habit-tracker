import { useMemo } from 'react'
import { useCalendar } from '../../hooks/useCalendar.ts'
import { useHabitContext } from '../../context/HabitContext.tsx'
import { formatDate } from '../../utils/dateUtils.ts'
import { format } from 'date-fns'
import { minutesToDisplay } from '../../utils/timeUtils.ts'
import { CalendarHeader } from './CalendarHeader.tsx'
import { CalendarDay } from './CalendarDay.tsx'
import { Modal } from '../common/Modal.tsx'
import styles from './CalendarView.module.css'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CalendarView() {
  const { state } = useHabitContext()
  const {
    currentMonth,
    calendarDays,
    completions,
    selectedDate,
    setSelectedDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getCompletionsForDate,
  } = useCalendar()

  const selectedCompletions = selectedDate ? getCompletionsForDate(selectedDate) : []
  const selectedDateFormatted = selectedDate
    ? format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')
    : ''

  // Monthly summary stats
  const monthStats = useMemo(() => {
    const activeHabits = state.habits.filter(h => !h.archived && h.trackingType !== 'water')
    if (activeHabits.length === 0) return null

    const daysWithActivity = new Set(completions.filter(c => c.value > 0).map(c => c.date)).size
    const uniqueCompletions = new Set(
      completions.filter(c => c.value > 0).map(c => `${c.habitId}-${c.date}`)
    ).size

    // Perfect days: all active habits completed
    let perfectDays = 0
    const dateSet = new Set(completions.map(c => c.date))
    for (const date of dateSet) {
      const dayCompletions = completions.filter(c => c.date === date && c.value > 0)
      const completedHabits = new Set(dayCompletions.map(c => c.habitId))
      if (activeHabits.every(h => completedHabits.has(h.id))) {
        perfectDays++
      }
    }

    return { daysWithActivity, uniqueCompletions, perfectDays }
  }, [completions, state.habits])

  // Habit legend
  const habitLegend = useMemo(() => {
    const habitIdsInMonth = new Set(completions.filter(c => c.value > 0).map(c => c.habitId))
    return state.habits.filter(h => habitIdsInMonth.has(h.id))
  }, [completions, state.habits])

  return (
    <div className={styles.container}>
      <div className={`card ${styles.calendarCard}`}>
        <CalendarHeader
          currentMonth={currentMonth}
          onPrev={goToPreviousMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
        />

        <div className={styles.weekdays}>
          {WEEKDAYS.map((day, i) => (
            <span key={i} className={styles.weekday}>{day}</span>
          ))}
        </div>

        <div className={styles.grid}>
          {calendarDays.map((date, i) => (
            <CalendarDay
              key={i}
              date={date}
              completions={date ? getCompletionsForDate(formatDate(date)) : []}
              habits={state.habits}
              selected={!!date && !!selectedDate && formatDate(date) === selectedDate}
              onSelect={setSelectedDate}
            />
          ))}
        </div>
      </div>

      {/* Month summary */}
      {monthStats && monthStats.daysWithActivity > 0 && (
        <div className={`card ${styles.summaryCard}`}>
          <h3 className={styles.summaryTitle}>Month Summary</h3>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{monthStats.daysWithActivity}</span>
              <span className={styles.statLabel}>Active Days</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{monthStats.perfectDays}</span>
              <span className={styles.statLabel}>Perfect Days</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{monthStats.uniqueCompletions}</span>
              <span className={styles.statLabel}>Completions</span>
            </div>
          </div>
        </div>
      )}

      {/* Habit legend */}
      {habitLegend.length > 0 && (
        <div className={`card ${styles.legendCard}`}>
          <h3 className={styles.legendTitle}>Habits This Month</h3>
          <div className={styles.legendList}>
            {habitLegend.map(habit => (
              <div key={habit.id} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: habit.color }} />
                <span className={styles.legendIcon}>{habit.icon}</span>
                <span className={styles.legendName}>{habit.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day detail sheet */}
      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDateFormatted}
      >
        {selectedCompletions.length === 0 ? (
          <div className={styles.emptyDay}>
            <span className={styles.emptyIcon}>○</span>
            <p>No habits completed this day.</p>
          </div>
        ) : (
          <div className={styles.detailList}>
            {selectedCompletions.map(completion => {
              const habit = state.habits.find(h => h.id === completion.habitId)
              if (!habit) return null
              return (
                <div key={completion.id} className={styles.detailItem}>
                  <span
                    className={styles.detailDot}
                    style={{ background: habit.color }}
                  />
                  <span className={styles.detailIcon}>{habit.icon || '✓'}</span>
                  <div className={styles.detailInfo}>
                    <span className={styles.detailName}>{habit.name}</span>
                    <span className={styles.detailMeta}>{habit.frequency}</span>
                  </div>
                  <span className={styles.detailValue} style={{ color: habit.color }}>
                    {habit.trackingType === 'checkbox'
                      ? '✓'
                      : habit.trackingType === 'time'
                      ? minutesToDisplay(completion.value)
                      : `${completion.value} ${habit.goal.unit}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
