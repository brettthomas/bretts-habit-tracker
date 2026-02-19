import { Outlet } from 'react-router-dom'
import { Header } from './Header.tsx'
import { BottomNav } from './BottomNav.tsx'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
