export const colors = {
  background: '#FAF6F0',
  cards: '#FFFFFF',
  primary: '#A8B5A2',
  primaryDark: '#7D8F74',
  accent: '#C4775A',
  text: '#3D3D3D',
  textSecondary: '#8A8178',
  border: '#D4CFC9',
  waterFill: '#7FB5D5',
  streakGold: '#D4A843',
} as const

export type ColorKey = keyof typeof colors
