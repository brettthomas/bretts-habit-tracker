import { useState, useEffect, useCallback } from 'react'
import type { CompletionRecord } from '../models/Completion.ts'
import { completionService } from '../services/completionService.ts'
import { formatDate, getCalendarDays, addMonths, subMonthsFn } from '../utils/dateUtils.ts'

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [completions, setCompletions] = useState<CompletionRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const calendarDays = getCalendarDays(year, month)

  const loadCompletions = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = formatDate(new Date(year, month, 1))
      const endDate = formatDate(new Date(year, month + 1, 0))
      const data = await completionService.getByDateRange(startDate, endDate)
      setCompletions(data)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    loadCompletions()
  }, [loadCompletions])

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonthsFn(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const goToToday = () => setCurrentMonth(new Date())

  const getCompletionsForDate = (date: string): CompletionRecord[] => {
    return completions.filter(c => c.date === date)
  }

  return {
    currentMonth,
    calendarDays,
    completions,
    selectedDate,
    loading,
    setSelectedDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getCompletionsForDate,
  }
}
