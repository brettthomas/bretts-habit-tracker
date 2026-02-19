import { useHabits } from '../hooks/useHabits.ts'
import { useCompletions } from '../hooks/useCompletions.ts'
import { MotivationalBanner } from '../components/streaks/MotivationalBanner.tsx'
import { WaterTracker } from '../components/water/WaterTracker.tsx'
import { HabitList } from '../components/habits/HabitList.tsx'
import { EmptyState } from '../components/common/EmptyState.tsx'
import { Button } from '../components/common/Button.tsx'
import { Confetti } from '../components/common/Confetti.tsx'
import { useNavigate } from 'react-router-dom'
import styles from './TodayPage.module.css'

export function TodayPage() {
  const { habits, loading } = useHabits()
  const { allDailyComplete } = useCompletions()
  const navigate = useNavigate()

  const nonWaterHabits = habits.filter(h => h.trackingType !== 'water')
  const dailyHabits = nonWaterHabits.filter(h => h.frequency === 'daily')
  const weeklyHabits = nonWaterHabits.filter(h => h.frequency === 'weekly')
  const monthlyHabits = nonWaterHabits.filter(h => h.frequency === 'monthly')
  const hasWaterHabit = habits.some(h => h.trackingType === 'water')
  const isSunday = new Date().getDay() === 0

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="Welcome, Brett!"
        description="Start tracking your habits by creating your first one."
        action={
          <Button variant="primary" onClick={() => navigate('/habits')}>
            Create Your First Habit
          </Button>
        }
      />
    )
  }

  return (
    <div className={styles.page}>
      {allDailyComplete && <Confetti />}
      <MotivationalBanner />

      {isSunday && (
        <div className={styles.teaserCard} onClick={() => navigate('/stats')}>
          <span className={styles.teaserIcon}>📊</span>
          <div className={styles.teaserText}>
            <span className={styles.teaserTitle}>Review your week</span>
            <span className={styles.teaserSub}>See how you did this week</span>
          </div>
          <span className={styles.teaserArrow}>→</span>
        </div>
      )}

      {hasWaterHabit && (
        <section className={styles.section}>
          <WaterTracker />
        </section>
      )}

      {dailyHabits.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Daily</h2>
          <HabitList habits={dailyHabits} />
        </section>
      )}

      {weeklyHabits.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Weekly</h2>
          <HabitList habits={weeklyHabits} />
        </section>
      )}

      {monthlyHabits.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Monthly</h2>
          <HabitList habits={monthlyHabits} />
        </section>
      )}
    </div>
  )
}
