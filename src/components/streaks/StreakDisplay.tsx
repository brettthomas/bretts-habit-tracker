import type { StreakInfo } from '../../models/Streak.ts'
import type { Habit } from '../../models/Habit.ts'
import { getMotivationalMessage } from '../../utils/streakCalculator.ts'
import { ProgressRing } from '../common/ProgressRing.tsx'
import { STREAK_MILESTONES } from '../../utils/constants.ts'
import styles from './StreakDisplay.module.css'

interface StreakDisplayProps {
  streak: StreakInfo
  habit: Habit
  completionPct?: number
}

export function StreakDisplay({ streak, habit, completionPct }: StreakDisplayProps) {
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak.currentStreak) ?? 365
  const milestoneProgress = streak.currentStreak / nextMilestone
  const message = getMotivationalMessage(streak)
  const isOnFire = streak.currentStreak >= 7

  return (
    <div className={styles.card} style={{ '--habit-color': habit.color } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.habitInfo}>
          <span className={styles.icon}>{habit.icon || '○'}</span>
          <div>
            <h4 className={styles.name}>{habit.name}</h4>
            <span className={styles.frequency}>{habit.frequency}</span>
          </div>
        </div>
        <ProgressRing
          progress={milestoneProgress}
          size={52}
          strokeWidth={4}
          color={habit.color}
        >
          <span className={styles.ringText}>
            {streak.currentStreak > 0 ? streak.currentStreak : '—'}
          </span>
        </ProgressRing>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{streak.currentStreak}</span>
          <span className={styles.statLabel}>Current</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statValue}>{streak.longestStreak}</span>
          <span className={styles.statLabel}>Best</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statValue}>{nextMilestone}</span>
          <span className={styles.statLabel}>Next Goal</span>
        </div>
        {completionPct !== undefined && (
          <>
            <div className={styles.divider} />
            <div className={styles.stat}>
              <span className={styles.statIcon}>📊</span>
              <span className={styles.statValue}>{completionPct}%</span>
              <span className={styles.statLabel}>This Week</span>
            </div>
          </>
        )}
      </div>

      {/* Completion bar */}
      {completionPct !== undefined && (
        <div className={styles.barContainer}>
          <div
            className={styles.bar}
            style={{
              width: `${Math.min(completionPct, 100)}%`,
              background: habit.color,
            }}
          />
        </div>
      )}

      {/* Motivational message */}
      {streak.currentStreak > 0 && (
        <p className={`${styles.message} ${isOnFire ? styles.onFire : ''}`}>
          {message}
        </p>
      )}

      {/* Milestone badges */}
      {streak.longestStreak >= 7 && (
        <div className={styles.badges}>
          {STREAK_MILESTONES.filter(m => streak.longestStreak >= m).map(m => (
            <span key={m} className={styles.badge} title={`${m}-day streak achieved`}>
              {m === 7 ? '🌱' : m === 14 ? '🌿' : m === 21 ? '🌳' : m === 30 ? '⭐' : m === 60 ? '💎' : m === 90 ? '👑' : m === 180 ? '🏅' : '🏆'}{m}d
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
