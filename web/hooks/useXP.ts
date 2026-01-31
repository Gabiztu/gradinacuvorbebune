'use client'

import { useState, useEffect, useCallback } from 'react'

const XP_PER_MESSAGE = 10
const STREAK_CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

export function useXP() {
  const [xp, setXP] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null)
  const [justEarnedBadge, setJustEarnedBadge] = useState<string | null>(null)

  useEffect(() => {
    // Load from localStorage
    const savedXP = localStorage.getItem('totalXP')
    const savedStreak = localStorage.getItem('streak')
    const savedLastActive = localStorage.getItem('lastActiveDate')

    if (savedXP) setXP(parseInt(savedXP))
    if (savedStreak) setStreak(parseInt(savedStreak))
    if (savedLastActive) setLastActiveDate(savedLastActive)
  }, [])

  const checkStreak = useCallback(() => {
    if (!lastActiveDate) return

    const lastActive = new Date(lastActiveDate)
    const now = new Date()
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

    if (diffHours > 48) {
      // Streak broken
      setStreak(0)
      localStorage.setItem('streak', '0')
    }
  }, [lastActiveDate])

  const addXP = useCallback((amount: number = XP_PER_MESSAGE) => {
    const now = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    setXP((prevXP) => {
      const newXP = prevXP + amount
      localStorage.setItem('totalXP', newXP.toString())

      // Check for badge milestones
      const badges = [
        { threshold: 50, name: '🌱 Primul pas' },
        { threshold: 100, name: '🌿 Creștere' },
        { threshold: 500, name: '🌳 Arbore' },
        { threshold: 1000, name: '🌸 Floare' },
      ]

      for (const badge of badges) {
        if (newXP >= badge.threshold && prevXP < badge.threshold) {
          setJustEarnedBadge(badge.name)
          setTimeout(() => setJustEarnedBadge(null), 3000)
          break
        }
      }

      return newXP
    })

    setStreak((prevStreak) => {
      let newStreak = prevStreak

      if (!lastActiveDate || lastActiveDate === yesterday) {
        // Same day or consecutive day - increment or keep
        newStreak = lastActiveDate === now ? prevStreak : prevStreak + 1
      } else if (lastActiveDate === now) {
        // Already active today
        newStreak = prevStreak
      } else {
        // Streak broken
        newStreak = 1
      }

      localStorage.setItem('streak', newStreak.toString())
      localStorage.setItem('lastActiveDate', now)
      setLastActiveDate(now)

      return newStreak
    })
  }, [lastActiveDate])

  const clearBadge = () => {
    setJustEarnedBadge(null)
  }

  return {
    xp,
    streak,
    addXP,
    justEarnedBadge,
    clearBadge,
    checkStreak,
  }
}
