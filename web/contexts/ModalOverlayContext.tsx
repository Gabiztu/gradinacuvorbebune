'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalOverlayContextType {
  isModalOpen: boolean
  setModalOpen: (open: boolean) => void
}

const ModalOverlayContext = createContext<ModalOverlayContextType>({
  isModalOpen: false,
  setModalOpen: () => {},
})

export function ModalOverlayProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setModalOpen] = useState(false)

  return (
    <ModalOverlayContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalOverlayContext.Provider>
  )
}

export function useModalOverlay() {
  return useContext(ModalOverlayContext)
}
