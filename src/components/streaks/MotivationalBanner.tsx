import { useMemo } from 'react'
import { useStreaks } from '../../hooks/useStreaks.ts'
import { useCompletions } from '../../hooks/useCompletions.ts'
import { useHabitContext } from '../../context/HabitContext.tsx'
import { getMotivationalMessage } from '../../utils/streakCalculator.ts'
import styles from './MotivationalBanner.module.css'

export function MotivationalBanner() {
  const { state } = useHabitContext()
  const { getBestOverallStreak } = useStreaks()
  const { allDailyComplete } = useCompletions()

  const message = useMemo(() => {
    if (allDailyComplete && state.habits.filter(h => h.frequency === 'daily').length > 0) {
      return "All daily habits complete! You're amazing! 🎉"
    }

    const best = getBestOverallStreak()
    if (best) {
      return getMotivationalMessage(best.streak)
    }

    return "Start building your habits today!"
  }, [allDailyComplete, state.habits, getBestOverallStreak])

  return (
    <div className={`card ${styles.banner} ${allDailyComplete ? styles.celebrate : ''}`}>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
