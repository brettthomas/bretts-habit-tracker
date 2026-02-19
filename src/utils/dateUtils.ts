import {
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  isWithinInterval,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths as dfSubMonths,
  getDaysInMonth,
  getDay,
  isToday as dfIsToday,
} from 'date-fns'
import type { Frequency } from '../models/Habit.ts'

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd')
export const formatDisplay = (date: Date): string => format(date, 'EEEE, MMMM d')
export const formatMonthYear = (date: Date): string => format(date, 'MMMM yyyy')
export const parseDate = (dateStr: string): Date => parseISO(dateStr)
export const today = (): string => formatDate(new Date())
export const isToday = (dateStr: string): boolean => dfIsToday(parseISO(dateStr))

export function getPeriodStart(date: Date, frequency: Frequency): Date {
  switch (frequency) {
    case 'daily': return startOfDay(date)
    case 'weekly': return startOfWeek(date, { weekStartsOn: 0 })
    case 'monthly': return startOfMonth(date)
    case 'quarterly': return startOfQuarter(date)
    case 'yearly': return startOfYear(date)
  }
}

export function getPeriodEnd(date: Date, frequency: Frequency): Date {
  switch (frequency) {
    case 'daily': return startOfDay(date)
    case 'weekly': return endOfWeek(date, { weekStartsOn: 0 })
    case 'monthly': return endOfMonth(date)
    case 'quarterly': return endOfQuarter(date)
    case 'yearly': return endOfYear(date)
  }
}

export function getPreviousPeriodStart(date: Date, frequency: Frequency): Date {
  switch (frequency) {
    case 'daily': return subDays(date, 1)
    case 'weekly': return subWeeks(startOfWeek(date, { weekStartsOn: 0 }), 1)
    case 'monthly': return subMonths(startOfMonth(date), 1)
    case 'quarterly': return subQuarters(startOfQuarter(date), 1)
    case 'yearly': return subYears(startOfYear(date), 1)
  }
}

export function isDateInPeriod(dateStr: string, periodStart: Date, periodEnd: Date): boolean {
  const date = parseISO(dateStr)
  return isWithinInterval(date, { start: startOfDay(periodStart), end: startOfDay(periodEnd) })
}

export function getDaysInPeriod(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) })
}

export function isSameDayStr(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b))
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = getDaysInMonth(firstDay)
  const startDayOfWeek = getDay(firstDay)

  const days: (Date | null)[] = []

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

export { addMonths, dfSubMonths as subMonthsFn }
