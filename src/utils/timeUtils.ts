/** Convert "HH:MM" (24h) to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Convert minutes since midnight to "HH:MM" (24h) */
export function minutesToTime24(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Convert minutes since midnight to "h:MM AM/PM" */
export function minutesToDisplay(minutes: number): string {
  if (minutes <= 0) return '—'
  const h24 = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Check if logged time meets the "by" target (e.g., in bed by 10 PM) */
export function isTimeOnTarget(loggedMinutes: number, targetMinutes: number): boolean {
  if (loggedMinutes <= 0) return false
  // Handle overnight: if target is late (e.g., 22:00) and logged is early AM (e.g., 1:00),
  // we treat early AM as "after midnight" — still counts if within 4h after midnight
  if (targetMinutes >= 720 && loggedMinutes < 240) {
    // Late-night target + early-morning log: user went past midnight, missed it
    return false
  }
  return loggedMinutes <= targetMinutes
}
