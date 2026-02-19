import { CalendarView } from '../components/calendar/CalendarView.tsx'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  return (
    <div className={styles.page}>
      <CalendarView />
    </div>
  )
}
