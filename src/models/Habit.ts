export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type TrackingType = 'checkbox' | 'counter' | 'water' | 'duration' | 'time'

export interface HabitGoal {
  targetCount: number
  targetValue: number
  unit: string
}

export interface Habit {
  id: string
  name: string
  frequency: Frequency
  trackingType: TrackingType
  goal: HabitGoal
  color: string
  icon: string
  createdAt: string
  sortOrder: number
  archived?: boolean
}

export type HabitFormData = Omit<Habit, 'id' | 'createdAt' | 'sortOrder'>
