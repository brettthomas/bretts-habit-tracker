import styles from './CounterTracker.module.css'

interface CounterTrackerProps {
  value: number
  target: number
  unit: string
  color: string
  onChange: (value: number) => void
}

export function CounterTracker({ value, target, unit, color, onChange }: CounterTrackerProps) {
  return (
    <div className={styles.counter}>
      <button
        className={styles.btn}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease"
        disabled={value <= 0}
      >
        -
      </button>
      <div className={styles.display}>
        <span className={styles.value} style={{ color: value >= target ? color : undefined }}>
          {value}
        </span>
        <span className={styles.target}>/ {target}{unit ? ` ${unit}` : ''}</span>
      </div>
      <button
        className={styles.btn}
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        style={{ background: color, color: 'white' }}
      >
        +
      </button>
    </div>
  )
}
