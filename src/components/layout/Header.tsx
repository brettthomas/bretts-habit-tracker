import { formatDisplay } from '../../utils/dateUtils.ts'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Brett's Habit Tracker</h1>
      <p className={styles.date}>{formatDisplay(new Date())}</p>
    </header>
  )
}
