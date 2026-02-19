import { formatMonthYear } from '../../utils/dateUtils.ts'
import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
  currentMonth: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({ currentMonth, onPrev, onNext, onToday }: CalendarHeaderProps) {
  return (
    <div className={styles.header}>
      <button className={styles.arrow} onClick={onPrev} aria-label="Previous month">
        ‹
      </button>
      <button className={styles.title} onClick={onToday}>
        {formatMonthYear(currentMonth)}
      </button>
      <button className={styles.arrow} onClick={onNext} aria-label="Next month">
        ›
      </button>
    </div>
  )
}
