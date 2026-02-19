import styles from './ProgressRing.module.css'

interface ProgressRingProps {
  progress: number // 0-1
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = 'var(--primary)',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(progress, 1))

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={styles.progress}
        />
      </svg>
      {children && <div className={styles.center}>{children}</div>}
    </div>
  )
}
