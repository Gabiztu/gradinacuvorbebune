'use client'

import { useState, useEffect, ReactNode } from 'react'

export function HydrationGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      setMounted(true)
    } catch (e) {
      console.error('HydrationGuard mount error:', e)
      setMounted(true)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}
