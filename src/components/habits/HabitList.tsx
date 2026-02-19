import { useState } from 'react'
import type { Habit } from '../../models/Habit.ts'
import { HabitCard } from './HabitCard.tsx'
import { HabitForm } from './HabitForm.tsx'
import { Modal } from '../common/Modal.tsx'
import { useHabitContext } from '../../context/HabitContext.tsx'
import styles from './HabitList.module.css'

interface HabitListProps {
  habits: Habit[]
}

export function HabitList({ habits }: HabitListProps) {
  const { updateHabit, reorderHabits } = useHabitContext()
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [reordering, setReordering] = useState(false)

  const moveHabit = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= habits.length) return
    const ids = habits.map(h => h.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    await reorderHabits(ids)
  }

  return (
    <>
      <div className={styles.header}>
        <button
          className={`${styles.reorderBtn} ${reordering ? styles.reorderActive : ''}`}
          onClick={() => setReordering(!reordering)}
        >
          {reordering ? 'Done' : 'Reorder'}
        </button>
      </div>

      <div className={styles.list}>
        {habits.map((habit, i) => (
          <div key={habit.id} className={styles.listItem}>
            {reordering && (
              <div className={styles.arrowCol}>
                <button
                  className={styles.arrowBtn}
                  disabled={i === 0}
                  onClick={() => moveHabit(i, -1)}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  className={styles.arrowBtn}
                  disabled={i === habits.length - 1}
                  onClick={() => moveHabit(i, 1)}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            )}
            <div className={styles.cardWrap}>
              <HabitCard
                habit={habit}
                onEdit={() => setEditingHabit(habit)}
                disableEdit={reordering}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
      >
        {editingHabit && (
          <HabitForm
            initial={editingHabit}
            onSubmit={async (data) => {
              await updateHabit(editingHabit.id, data)
              setEditingHabit(null)
            }}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </Modal>
    </>
  )
}
