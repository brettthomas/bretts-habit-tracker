import type { HabitFormData } from '../../models/Habit.ts'
import { HABIT_TEMPLATES } from '../../utils/constants.ts'
import styles from './TemplatePicker.module.css'

interface TemplatePickerProps {
  onSelect: (template: Partial<HabitFormData>) => void
  onScratch: () => void
}

export function TemplatePicker({ onSelect, onScratch }: TemplatePickerProps) {
  return (
    <div className={styles.picker}>
      <p className={styles.subtitle}>Choose a template or start from scratch</p>
      <div className={styles.grid}>
        {HABIT_TEMPLATES.map((t) => (
          <button
            key={t.name}
            className={styles.templateCard}
            onClick={() => onSelect({
              name: t.name,
              frequency: t.frequency,
              trackingType: t.trackingType,
              goal: { ...t.goal },
              color: t.color,
              icon: t.icon,
            })}
          >
            <span className={styles.templateIcon}>{t.icon}</span>
            <span className={styles.templateName}>{t.name}</span>
            <span className={styles.templateDesc}>{t.description}</span>
          </button>
        ))}
      </div>
      <button className={styles.scratchBtn} onClick={onScratch}>
        Start from scratch
      </button>
    </div>
  )
}
