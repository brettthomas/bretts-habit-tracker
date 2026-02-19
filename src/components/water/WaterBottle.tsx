import { WATER_BOTTLE_OZ } from '../../utils/constants.ts'
import styles from './WaterBottle.module.css'

interface WaterBottleProps {
  filled: boolean
  index: number
  onToggle: () => void
}

export function WaterBottle({ filled, index, onToggle }: WaterBottleProps) {
  return (
    <button
      className={`${styles.bottle} ${filled ? styles.filled : ''}`}
      onClick={onToggle}
      aria-label={`Water bottle ${index + 1}: ${filled ? 'filled, tap to empty' : 'empty, tap to fill'} (${WATER_BOTTLE_OZ}oz)`}
    >
      <svg viewBox="0 0 60 100" className={styles.svg}>
        {/* Bottle outline */}
        <path
          d="M22 8 L22 20 Q10 28 10 40 L10 85 Q10 92 17 92 L43 92 Q50 92 50 85 L50 40 Q50 28 38 20 L38 8 Z"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          className={styles.outline}
        />
        {/* Cap */}
        <rect x="20" y="2" width="20" height="8" rx="3" fill="var(--border)" />
        {/* Fill */}
        <clipPath id={`bottle-clip-${index}`}>
          <path d="M22 8 L22 20 Q10 28 10 40 L10 85 Q10 92 17 92 L43 92 Q50 92 50 85 L50 40 Q50 28 38 20 L38 8 Z" />
        </clipPath>
        <rect
          x="10"
          y="20"
          width="40"
          height="72"
          fill="var(--water-fill)"
          clipPath={`url(#bottle-clip-${index})`}
          className={styles.water}
        />
      </svg>
      <span className={styles.label}>{WATER_BOTTLE_OZ}oz</span>
    </button>
  )
}
