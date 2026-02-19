import { useState } from 'react'
import type { Habit } from '../../models/Habit.ts'
import { useCompletions } from '../../hooks/useCompletions.ts'
import { useStreaks } from '../../hooks/useStreaks.ts'
import { CheckboxTracker } from './CheckboxTracker.tsx'
import { CounterTracker } from './CounterTracker.tsx'
import { DurationTracker } from './DurationTracker.tsx'
import { TimeTracker } from './TimeTracker.tsx'
import { isTimeOnTarget } from '../../utils/timeUtils.ts'
import { StreakFlame } from '../streaks/StreakFlame.tsx'
import styles from './HabitCard.module.css'

interface HabitCardProps {
  habit: Habit
  onEdit?: () => void
  disableEdit?: boolean
}

export function HabitCard({ habit, onEdit, disableEdit }: HabitCardProps) {
  const { isCompleted, getValue, toggleCompletion, logCompletion, getNote, addNote } = useCompletions()
  const { getStreak } = useStreaks()
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState('')

  const streak = getStreak(habit.id)
  const value = getValue(habit.id)
  const completed = habit.trackingType === 'checkbox'
    ? isCompleted(habit.id)
    : habit.trackingType === 'time'
    ? isTimeOnTarget(value, habit.goal.targetValue)
    : value >= habit.goal.targetValue

  const existingNote = getNote(habit.id)

  const handleStartEditNote = () => {
    setNoteText(existingNote ?? '')
    setEditingNote(true)
  }

  const handleSaveNote = async () => {
    if (noteText.trim()) {
      await addNote(habit.id, noteText.trim())
    }
    setEditingNote(false)
  }

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveNote()
    if (e.key === 'Escape') setEditingNote(false)
  }

  const renderTracker = () => {
    switch (habit.trackingType) {
      case 'checkbox':
        return (
          <CheckboxTracker
            checked={isCompleted(habit.id)}
            color={habit.color}
            onToggle={() => toggleCompletion(habit.id)}
          />
        )
      case 'counter':
        return (
          <CounterTracker
            value={value}
            target={habit.goal.targetValue}
            unit={habit.goal.unit}
            color={habit.color}
            onChange={v => logCompletion(habit.id, v)}
          />
        )
      case 'duration':
        return (
          <DurationTracker
            value={value}
            target={habit.goal.targetValue}
            color={habit.color}
            onChange={v => logCompletion(habit.id, v)}
          />
        )
      case 'time':
        return (
          <TimeTracker
            value={value}
            target={habit.goal.targetValue}
            color={habit.color}
            checked={isCompleted(habit.id)}
            onToggle={() => toggleCompletion(habit.id)}
            onChange={v => logCompletion(habit.id, v)}
          />
        )
      case 'water':
        return null // Water has its own dedicated widget
    }
  }

  const clickHandler = disableEdit ? undefined : onEdit

  return (
    <div
      className={`card ${styles.card} ${completed ? styles.completed : ''} ${clickHandler ? styles.editable : ''}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      <div className={styles.top}>
        <div className={styles.info} onClick={clickHandler}>
          {habit.icon && <span className={styles.icon}>{habit.icon}</span>}
          <div>
            <h3 className={styles.name}>{habit.name}</h3>
            <span className={styles.frequency}>{habit.frequency}</span>
          </div>
        </div>
        <div className={styles.right} onClick={e => e.stopPropagation()}>
          {streak.currentStreak > 0 && (
            <StreakFlame streak={streak.currentStreak} />
          )}
          {renderTracker()}
        </div>
      </div>

      {/* Note section — only when completed */}
      {completed && (
        <div className={styles.noteSection}>
          {editingNote ? (
            <div className={styles.noteInputRow}>
              <input
                className={styles.noteInput}
                type="text"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Add a note..."
                autoFocus
                maxLength={200}
              />
              <button className={styles.noteSave} onClick={handleSaveNote}>Save</button>
              <button className={styles.noteCancel} onClick={() => setEditingNote(false)}>Cancel</button>
            </div>
          ) : existingNote ? (
            <p className={styles.noteText} onClick={handleStartEditNote}>
              {existingNote}
            </p>
          ) : (
            <button className={styles.addNoteBtn} onClick={handleStartEditNote}>
              + Add note
            </button>
          )}
        </div>
      )}
    </div>
  )
}
