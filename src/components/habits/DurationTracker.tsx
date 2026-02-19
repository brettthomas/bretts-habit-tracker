import styles from './DurationTracker.module.css'

interface DurationTrackerProps {
  value: number // minutes
  target: number
  color: string
  onChange: (value: number) => void
}

export function DurationTracker({ value, target, color, onChange }: DurationTrackerProps) {
  const increments = [5, 10, 15, 30]

  return (
    <div className={styles.wrapper}>
      <div className={styles.display}>
        <span className={styles.value} style={{ color: value >= target ? color : undefined }}>
          {value}
        </span>
        <span className={styles.unit}>/ {target} min</span>
      </div>
      <div className={styles.buttons}>
        {increments.map(inc => (
          <button
            key={inc}
            className={styles.increment}
            onClick={() => onChange(value + inc)}
            style={{ borderColor: color }}
          >
            +{inc}m
          </button>
        ))}
        {value > 0 && (
          <button
            className={styles.reset}
            onClick={() => onChange(0)}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
