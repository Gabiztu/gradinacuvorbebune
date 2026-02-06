'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TransitionContextType {
  isExiting: boolean
  startExit: () => void
}

const TransitionContext = createContext<TransitionContextType>({
  isExiting: false,
  startExit: () => {},
})

export function useTransition() {
  return useContext(TransitionContext)
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isExiting, setIsExiting] = useState(false)

  const startExit = () => {
    setIsExiting(true)
  }

  return (
    <TransitionContext.Provider value={{ isExiting, startExit }}>
      {children}
    </TransitionContext.Provider>
  )
}
