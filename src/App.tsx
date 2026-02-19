import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HabitProvider } from './context/HabitContext.tsx'
import { AppShell } from './components/layout/AppShell.tsx'
import { TodayPage } from './pages/TodayPage.tsx'
import { HabitsPage } from './pages/HabitsPage.tsx'
import { CalendarPage } from './pages/CalendarPage.tsx'
import { StatsPage } from './pages/StatsPage.tsx'
import { TodoPage } from './pages/TodoPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <HabitProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<TodayPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </HabitProvider>
    </BrowserRouter>
  )
}
