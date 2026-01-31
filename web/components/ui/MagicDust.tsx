'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  velocity: number
}

interface MagicDustProps {
  trigger: boolean
  onComplete?: () => void
  color?: string
  particleCount?: number
  children?: React.ReactNode
  x?: number
  y?: number
}

export function useMagicDust() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isActive, setIsActive] = useState(false)
  const particleIdRef = useRef(0)

  const trigger = useCallback((x: number, y: number, color: string = '#22c55e') => {
    const newParticles: Particle[] = []
    const count = 8
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        color,
        size: 3 + Math.random() * 4,
        angle,
        velocity: 30 + Math.random() * 40
      })
    }
    
    setParticles(newParticles)
    setIsActive(true)

    setTimeout(() => {
      setParticles([])
      setIsActive(false)
    }, 600)
  }, [])

  const DustBurst = useCallback(({ 
    color = '#22c55e',
    particleCount = 8 
  }: { color?: string; particleCount?: number } = {}) => {
    if (!isActive || particles.length === 0) return null

    return createPortal(
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              scale: 0,
              opacity: 1
            }}
            animate={{ 
              x: particle.x + Math.cos(particle.angle) * particle.velocity,
              y: particle.y + Math.sin(particle.angle) * particle.velocity,
              scale: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 0.5, 
              ease: 'easeOut' 
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        ))}
      </AnimatePresence>,
      document.body
    )
  }, [isActive, particles])

  return { trigger, DustBurst }
}

export function MagicDust({ 
  trigger, 
  onComplete,
  color = '#22c55e',
  particleCount = 8,
  children,
  x = 0,
  y = 0
}: MagicDustProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef(0)

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = []
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
        newParticles.push({
          id: particleIdRef.current++,
          x,
          y,
          color,
          size: 3 + Math.random() * 4,
          angle,
          velocity: 25 + Math.random() * 35
        })
      }
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [trigger, x, y, color, particleCount, onComplete, children])

  if (!children) {
    return createPortal(
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              scale: 1,
              opacity: 1
            }}
            animate={{ 
              x: particle.x + Math.cos(particle.angle) * particle.velocity,
              y: particle.y + Math.sin(particle.angle) * particle.velocity,
              scale: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 0.45, 
              ease: 'easeOut' 
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        ))}
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <>
      {children}
      {createPortal(
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y,
                scale: 1,
                opacity: 1
              }}
              animate={{ 
                x: particle.x + Math.cos(particle.angle) * particle.velocity,
                y: particle.y + Math.sin(particle.angle) * particle.velocity,
                scale: 0,
                opacity: 0
              }}
              transition={{ 
                duration: 0.45, 
                ease: 'easeOut' 
              }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                pointerEvents: 'none',
                zIndex: 9999
              }}
            />
          ))}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export function MagicDustButton({ 
  onClick, 
  children, 
  color = '#22c55e',
  className = '',
  ...props 
}: { 
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
  color?: string
  className?: string
  [key: string]: any
}) {
  const [trigger, setTrigger] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    
    setPosition({ x, y })
    setTrigger(true)

    setTimeout(() => setTrigger(false), 500)
    
    onClick?.(e)
  }

  return (
    <>
      <button 
        onClick={handleClick} 
        className={className}
        {...props}
      >
        {children}
      </button>
      <MagicDust 
        trigger={trigger} 
        x={position.x} 
        y={position.y} 
        color={color}
      />
    </>
  )
}
