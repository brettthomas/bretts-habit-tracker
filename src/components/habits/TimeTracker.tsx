import { useState } from 'react'
import { minutesToDisplay, minutesToTime24, timeToMinutes } from '../../utils/timeUtils.ts'
import { CheckboxTracker } from './CheckboxTracker.tsx'
import styles from './TimeTracker.module.css'

interface TimeTrackerProps {
  value: number // minutes since midnight (0 = not logged)
  target: number // target minutes since midnight
  color: string
  checked: boolean
  onToggle: () => void
  onChange: (value: number) => void
}

export function TimeTracker({ value, target, color, checked, onToggle, onChange }: TimeTrackerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const isLogged = value > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = timeToMinutes(e.target.value)
    onChange(minutes)
  }

  return (
    <div className={styles.tracker}>
      <div className={styles.timeInfo}>
        {isLogged ? (
          <button className={styles.timeBtn} onClick={() => setShowPicker(!showPicker)}>
            <span className={styles.logged}>{minutesToDisplay(value)}</span>
          </button>
        ) : (
          <button
            className={styles.timeBtn}
            onClick={() => setShowPicker(!showPicker)}
          >
            <span className={styles.placeholder}>Log time</span>
          </button>
        )}
        <span className={styles.goal}>by {minutesToDisplay(target)}</span>
      </div>

      {showPicker && (
        <input
          type="time"
          className={styles.input}
          value={isLogged ? minutesToTime24(value) : ''}
          onChange={handleChange}
          aria-label="Log time"
          autoFocus
        />
      )}

      <CheckboxTracker
        checked={checked}
        color={color}
        onToggle={onToggle}
      />
    </div>
  )
}
