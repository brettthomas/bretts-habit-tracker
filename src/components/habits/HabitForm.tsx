import { useState } from 'react'
import type { HabitFormData, Frequency, TrackingType } from '../../models/Habit.ts'
import { HABIT_COLORS, FREQUENCY_OPTIONS, TRACKING_TYPE_OPTIONS, WATER_GOAL_OZ } from '../../utils/constants.ts'
import { minutesToTime24, timeToMinutes } from '../../utils/timeUtils.ts'
import { Button } from '../common/Button.tsx'
import styles from './HabitForm.module.css'

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void
  onCancel: () => void
  initial?: Partial<HabitFormData>
}

export function HabitForm({ onSubmit, onCancel, initial }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'daily')
  const [trackingType, setTrackingType] = useState<TrackingType>(initial?.trackingType ?? 'checkbox')
  const [targetValue, setTargetValue] = useState(initial?.goal?.targetValue ?? 1)
  const [targetTime, setTargetTime] = useState(
    initial?.trackingType === 'time' && initial?.goal?.targetValue
      ? minutesToTime24(initial.goal.targetValue)
      : '22:00'
  )
  const [unit, setUnit] = useState(initial?.goal?.unit ?? '')
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0])
  const [icon, setIcon] = useState(initial?.icon ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      frequency,
      trackingType,
      goal: {
        targetCount: 1,
        targetValue: trackingType === 'checkbox' ? 1
          : trackingType === 'time' ? timeToMinutes(targetTime)
          : targetValue,
        unit: trackingType === 'water' ? 'oz'
          : trackingType === 'duration' ? 'min'
          : trackingType === 'time' ? 'time'
          : unit,
      },
      color,
      icon,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Habit Name</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Morning Run"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Frequency</label>
        <div className={styles.chips}>
          {FREQUENCY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.chip} ${frequency === opt.value ? styles.chipActive : ''}`}
              onClick={() => setFrequency(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tracking Type</label>
        <div className={styles.typeGrid}>
          {TRACKING_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.typeCard} ${trackingType === opt.value ? styles.typeCardActive : ''}`}
              onClick={() => {
                setTrackingType(opt.value)
                if (opt.value === 'water') setTargetValue(WATER_GOAL_OZ)
              }}
            >
              <span className={styles.typeName}>{opt.label}</span>
              <span className={styles.typeDesc}>{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {(trackingType === 'counter' || trackingType === 'duration') && (
        <div className={styles.field}>
          <label className={styles.label}>
            Goal per {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : frequency === 'monthly' ? 'month' : 'period'}
          </label>
          <div className={styles.inlineFields}>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={targetValue}
              onChange={e => setTargetValue(Number(e.target.value))}
              placeholder="e.g., 4"
            />
            <input
              className={styles.input}
              type="text"
              value={trackingType === 'duration' ? 'min' : unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="e.g., times, mins, pages"
              disabled={trackingType === 'duration'}
            />
          </div>
        </div>
      )}

      {trackingType === 'time' && (
        <div className={styles.field}>
          <label className={styles.label}>Target Time (by when?)</label>
          <input
            className={styles.input}
            type="time"
            value={targetTime}
            onChange={e => setTargetTime(e.target.value)}
          />
        </div>
      )}

      {trackingType === 'water' && (
        <div className={styles.field}>
          <label className={styles.label}>Daily Water Goal (oz)</label>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={targetValue}
            onChange={e => setTargetValue(Number(e.target.value))}
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Icon (emoji)</label>
        <input
          className={styles.input}
          type="text"
          value={icon}
          onChange={e => setIcon(e.target.value)}
          placeholder="e.g., 🏃‍♀️"
          maxLength={4}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colors}>
          {HABIT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={!name.trim()}>
          {initial ? 'Save Changes' : 'Create Habit'}
        </Button>
      </div>
    </form>
  )
}
