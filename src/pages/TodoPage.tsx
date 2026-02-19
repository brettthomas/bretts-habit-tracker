import { useState, useEffect } from 'react'
import { storage } from '../services/storage.ts'
import { EmptyState } from '../components/common/EmptyState.tsx'
import { Button } from '../components/common/Button.tsx'
import { formatDate } from '../utils/dateUtils.ts'
import type { TodoItem } from '../models/Todo.ts'
import styles from './TodoPage.module.css'

export function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')
  const today = formatDate(new Date())

  useEffect(() => {
    storage.getTodosByDate(today).then(setTodos)
  }, [today])

  const addTodo = async () => {
    const text = input.trim()
    if (!text) return
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      date: today,
    }
    await storage.putTodo(todo)
    setTodos(prev => [...prev, todo])
    setInput('')
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const updated = { ...todo, completed: !todo.completed }
    await storage.putTodo(updated)
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
  }

  const removeTodo = async (id: string) => {
    await storage.deleteTodo(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const pending = todos.filter(t => !t.completed)
  const completed = todos.filter(t => t.completed)

  return (
    <div className={styles.page}>
      <form
        className={styles.inputRow}
        onSubmit={e => {
          e.preventDefault()
          addTodo()
        }}
      >
        <input
          className={styles.input}
          type="text"
          placeholder="Add a to-do..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button variant="primary" size="sm" type="submit">
          Add
        </Button>
      </form>

      {todos.length === 0 && (
        <EmptyState
          icon="☑"
          title="No to-dos yet"
          description="Add something you want to get done today."
        />
      )}

      {pending.length > 0 && (
        <div className={styles.list}>
          {pending.map(todo => (
            <div key={todo.id} className={styles.todoItem}>
              <button
                className={styles.checkbox}
                onClick={() => toggleTodo(todo.id)}
                aria-label="Mark complete"
              />
              <span className={styles.todoText}>{todo.text}</span>
              <button
                className={styles.deleteBtn}
                onClick={() => removeTodo(todo.id)}
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className={styles.list}>
          <span className={styles.sectionTitle}>Completed</span>
          {completed.map(todo => (
            <div key={todo.id} className={styles.todoItem}>
              <button
                className={`${styles.checkbox} ${styles.checked}`}
                onClick={() => toggleTodo(todo.id)}
                aria-label="Mark incomplete"
              >
                ✓
              </button>
              <span className={`${styles.todoText} ${styles.completed}`}>
                {todo.text}
              </span>
              <button
                className={styles.deleteBtn}
                onClick={() => removeTodo(todo.id)}
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
