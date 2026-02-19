import styles from './CheckboxTracker.module.css'

interface CheckboxTrackerProps {
  checked: boolean
  color: string
  onToggle: () => void
}

export function CheckboxTracker({ checked, color, onToggle }: CheckboxTrackerProps) {
  return (
    <button
      className={`${styles.checkbox} ${checked ? styles.checked : ''}`}
      style={{ '--habit-color': color } as React.CSSProperties}
      onClick={onToggle}
      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
    >
      {checked && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9l3.5 3.5L14 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
