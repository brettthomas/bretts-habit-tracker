import { useEffect, useState } from 'react'
import styles from './Confetti.module.css'

const COLORS = ['#A8B5A2', '#C4775A', '#7FB5D5', '#D4A843', '#B8A9C9']
const PARTICLE_COUNT = 30

interface Particle {
  id: number
  color: string
  left: number
  delay: number
  size: number
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const items = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: 4 + Math.random() * 6,
    }))
    setParticles(items)

    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={styles.confetti} aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  )
}
