'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

export function HydrationGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]" />
    )
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
