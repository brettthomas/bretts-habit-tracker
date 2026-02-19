import styles from './StreakFlame.module.css'

interface StreakFlameProps {
  streak: number
}

export function StreakFlame({ streak }: StreakFlameProps) {
  // Scale flame size with streak (min 16px, max 28px)
  const size = Math.min(28, 16 + Math.floor(streak / 3) * 2)

  return (
    <span
      className={styles.flame}
      style={{ fontSize: `${size}px` }}
      title={`${streak} day streak`}
      role="img"
      aria-label={`${streak} day streak`}
    >
      <span className={styles.icon}>🔥</span>
      <span className={styles.count}>{streak}</span>
    </span>
  )
}
