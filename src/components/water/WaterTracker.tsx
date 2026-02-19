import { useWaterTracker } from '../../hooks/useWaterTracker.ts'
import { WATER_BOTTLE_OZ } from '../../utils/constants.ts'
import { WaterBottle } from './WaterBottle.tsx'
import styles from './WaterTracker.module.css'

export function WaterTracker() {
  const { waterHabit, currentOz, goalOz, bottlesFilled, bottleCount, toggleBottle, addExtraBottle, isComplete } = useWaterTracker()

  if (!waterHabit) return null

  return (
    <div className={`card ${styles.card} ${isComplete ? styles.complete : ''}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Water Intake</h3>
          <span className={styles.frequency}>{waterHabit.frequency}</span>
        </div>
        <span className={styles.progress}>
          {currentOz} / {goalOz} oz
        </span>
      </div>
      <div className={styles.bottles}>
        {Array.from({ length: bottleCount }, (_, i) => (
          <WaterBottle
            key={i}
            index={i}
            filled={i < bottlesFilled}
            onToggle={() => toggleBottle(i)}
          />
        ))}
        {isComplete && (
          <button
            className={styles.addBottle}
            onClick={addExtraBottle}
            aria-label={`Add extra water bottle (${WATER_BOTTLE_OZ}oz)`}
          >
            <svg viewBox="0 0 60 100" className={styles.addSvg}>
              <path
                d="M22 8 L22 20 Q10 28 10 40 L10 85 Q10 92 17 92 L43 92 Q50 92 50 85 L50 40 Q50 28 38 20 L38 8 Z"
                fill="none"
                stroke="var(--border)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <rect x="20" y="2" width="20" height="8" rx="3" fill="var(--border)" opacity="0.5" />
              <text x="30" y="58" textAnchor="middle" fontSize="24" fill="var(--water-fill)">+</text>
            </svg>
            <span className={styles.addLabel}>{WATER_BOTTLE_OZ}oz</span>
          </button>
        )}
      </div>
      {isComplete && (
        <p className={styles.message}>Great hydration today!</p>
      )}
    </div>
  )
}
