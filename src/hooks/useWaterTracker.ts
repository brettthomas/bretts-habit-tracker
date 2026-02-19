import { useMemo } from 'react'
import { useHabitContext } from '../context/HabitContext.tsx'
import { WATER_BOTTLE_OZ, WATER_GOAL_OZ } from '../utils/constants.ts'

export function useWaterTracker() {
  const { state, logCompletion } = useHabitContext()

  const waterHabit = useMemo(
    () => state.habits.find(h => h.trackingType === 'water'),
    [state.habits],
  )

  const currentOz = useMemo(() => {
    if (!waterHabit) return 0
    const completion = state.todayCompletions.find(c => c.habitId === waterHabit.id)
    return completion?.value ?? 0
  }, [waterHabit, state.todayCompletions])

  const goalOz = waterHabit?.goal?.targetValue ?? WATER_GOAL_OZ

  const bottlesFilled = Math.floor(currentOz / WATER_BOTTLE_OZ)

  const bottleCount = Math.max(Math.ceil(goalOz / WATER_BOTTLE_OZ), bottlesFilled)

  const toggleBottle = async (bottleIndex: number) => {
    if (!waterHabit) return

    const targetBottle = bottleIndex + 1
    if (bottlesFilled >= targetBottle) {
      // Unfill: set to previous bottle level
      await logCompletion(waterHabit.id, bottleIndex * WATER_BOTTLE_OZ)
    } else {
      // Fill up to this bottle
      await logCompletion(waterHabit.id, targetBottle * WATER_BOTTLE_OZ)
    }
  }

  const addExtraBottle = async () => {
    if (!waterHabit) return
    await logCompletion(waterHabit.id, (bottlesFilled + 1) * WATER_BOTTLE_OZ)
  }

  return {
    waterHabit,
    currentOz,
    goalOz,
    bottlesFilled,
    bottleCount,
    toggleBottle,
    addExtraBottle,
    isComplete: currentOz >= goalOz,
  }
}
