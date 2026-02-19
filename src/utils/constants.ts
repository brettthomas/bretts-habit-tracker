export const WATER_BOTTLE_OZ = 24
export const WATER_GOAL_OZ = 72
export const WATER_BOTTLE_COUNT = 3

export const HABIT_COLORS = [
  '#A8B5A2', // sage green
  '#C4775A', // terracotta
  '#7FB5D5', // gentle blue
  '#D4A843', // streak gold
  '#B8A9C9', // lavender
  '#D4A88C', // warm tan
  '#8FB8A0', // mint
  '#C9968E', // dusty rose
] as const

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const

export const TRACKING_TYPE_OPTIONS = [
  { value: 'checkbox', label: 'Checkbox', description: 'Simple yes/no' },
  { value: 'counter', label: 'Counter', description: 'Count occurrences' },
  { value: 'water', label: 'Water', description: 'Track water intake' },
  { value: 'duration', label: 'Duration', description: 'Track time spent' },
  { value: 'time', label: 'Time', description: 'Log a specific time' },
] as const

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 180, 365] as const

export const HABIT_TEMPLATES = [
  {
    name: 'Exercise',
    frequency: 'daily' as const,
    trackingType: 'duration' as const,
    goal: { targetCount: 1, targetValue: 30, unit: 'min' },
    color: '#C4775A',
    icon: '🏋️',
    description: '30 minutes daily',
  },
  {
    name: 'Reading',
    frequency: 'daily' as const,
    trackingType: 'counter' as const,
    goal: { targetCount: 1, targetValue: 20, unit: 'pages' },
    color: '#7FB5D5',
    icon: '📖',
    description: '20 pages daily',
  },
  {
    name: 'Meditation',
    frequency: 'daily' as const,
    trackingType: 'duration' as const,
    goal: { targetCount: 1, targetValue: 10, unit: 'min' },
    color: '#B8A9C9',
    icon: '🧘',
    description: '10 minutes daily',
  },
  {
    name: 'Sleep by 10 PM',
    frequency: 'daily' as const,
    trackingType: 'time' as const,
    goal: { targetCount: 1, targetValue: 22 * 60, unit: 'time' },
    color: '#8FB8A0',
    icon: '😴',
    description: 'In bed by 10 PM',
  },
  {
    name: 'Journaling',
    frequency: 'daily' as const,
    trackingType: 'checkbox' as const,
    goal: { targetCount: 1, targetValue: 1, unit: '' },
    color: '#D4A843',
    icon: '📝',
    description: 'Write daily',
  },
  {
    name: 'Take Vitamins',
    frequency: 'daily' as const,
    trackingType: 'checkbox' as const,
    goal: { targetCount: 1, targetValue: 1, unit: '' },
    color: '#A8B5A2',
    icon: '💊',
    description: 'Daily vitamins',
  },
  {
    name: 'Walk 10k Steps',
    frequency: 'daily' as const,
    trackingType: 'counter' as const,
    goal: { targetCount: 1, targetValue: 10000, unit: 'steps' },
    color: '#C9968E',
    icon: '🚶',
    description: '10,000 steps daily',
  },
  {
    name: 'Stretching',
    frequency: 'daily' as const,
    trackingType: 'duration' as const,
    goal: { targetCount: 1, targetValue: 15, unit: 'min' },
    color: '#D4A88C',
    icon: '🤸',
    description: '15 minutes daily',
  },
] as const
