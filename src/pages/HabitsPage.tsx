import { useState } from 'react'
import { useHabits } from '../hooks/useHabits.ts'
import { HabitForm } from '../components/habits/HabitForm.tsx'
import { TemplatePicker } from '../components/habits/TemplatePicker.tsx'
import { Modal } from '../components/common/Modal.tsx'
import { Button } from '../components/common/Button.tsx'
import { EmptyState } from '../components/common/EmptyState.tsx'
import { useHabitContext } from '../context/HabitContext.tsx'
import { minutesToDisplay } from '../utils/timeUtils.ts'
import type { HabitFormData } from '../models/Habit.ts'
import styles from './HabitsPage.module.css'

export function HabitsPage() {
  const { habits, archiveHabit, deleteHabit } = useHabits()
  const { updateHabit } = useHabitContext()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [createInitial, setCreateInitial] = useState<Partial<HabitFormData> | undefined>(undefined)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { createHabit } = useHabits()

  const editingHabit = habits.find(h => h.id === editingId)

  const handleNewHabit = () => {
    setShowTemplatePicker(true)
  }

  const handleTemplateSelect = (template: Partial<HabitFormData>) => {
    setCreateInitial(template)
    setShowTemplatePicker(false)
    setShowCreateForm(true)
  }

  const handleScratch = () => {
    setCreateInitial(undefined)
    setShowTemplatePicker(false)
    setShowCreateForm(true)
  }

  const handleCloseCreate = () => {
    setShowCreateForm(false)
    setCreateInitial(undefined)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Habits</h2>
        <Button variant="primary" size="sm" onClick={handleNewHabit}>
          + New Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No habits yet"
          description="Create your first habit to get started on your journey."
          action={
            <Button variant="primary" onClick={handleNewHabit}>
              Create Habit
            </Button>
          }
        />
      ) : (
        <div className={styles.list}>
          {habits.map(habit => (
            <div key={habit.id} className={`card ${styles.item}`}>
              <div className={styles.itemInfo}>
                <span className={styles.icon}>{habit.icon || '○'}</span>
                <div>
                  <h3 className={styles.name}>{habit.name}</h3>
                  <span className={styles.meta}>
                    {habit.frequency} · {habit.trackingType}
                    {habit.trackingType === 'time'
                      ? ` · Goal: by ${minutesToDisplay(habit.goal.targetValue)}`
                      : habit.trackingType !== 'checkbox' && ` · Goal: ${habit.goal.targetValue} ${habit.goal.unit}`}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(habit.id)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => archiveHabit(habit.id)}>
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
                      deleteHabit(habit.id)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showTemplatePicker} onClose={() => setShowTemplatePicker(false)} title="New Habit">
        <TemplatePicker onSelect={handleTemplateSelect} onScratch={handleScratch} />
      </Modal>

      <Modal open={showCreateForm} onClose={handleCloseCreate} title="New Habit">
        <HabitForm
          initial={createInitial}
          onSubmit={async (data) => {
            await createHabit(data)
            handleCloseCreate()
          }}
          onCancel={handleCloseCreate}
        />
      </Modal>

      <Modal open={!!editingHabit} onClose={() => setEditingId(null)} title="Edit Habit">
        {editingHabit && (
          <HabitForm
            initial={editingHabit}
            onSubmit={async (data) => {
              await updateHabit(editingHabit.id, data)
              setEditingId(null)
            }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </div>
  )
}
