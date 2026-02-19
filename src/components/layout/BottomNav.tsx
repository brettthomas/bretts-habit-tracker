import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const navItems = [
  { to: '/', label: 'Today', icon: '☀' },
  { to: '/habits', label: 'Habits', icon: '✦' },
  { to: '/calendar', label: 'Calendar', icon: '▦' },
  { to: '/stats', label: 'Stats', icon: '◈' },
  { to: '/todo', label: 'To Do', icon: '☑' },
] as const

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
          end={item.to === '/'}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
