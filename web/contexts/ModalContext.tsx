'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalContextType {
  blurLevel: number
  setBlurLevel: (level: number) => void
  modals: Array<{ id: string; title?: string; content: ReactNode; onClose: () => void }>
  openModal: (id: string, title: string, content: ReactNode, onClose: () => void) => void
  closeModal: (id: string) => void
}

const ModalContext = createContext<ModalContextType>({
  blurLevel: 0,
  setBlurLevel: () => {},
  modals: [],
  openModal: () => {},
  closeModal: () => {},
})

export function ModalProvider({ children }: { children: ReactNode }) {
  const [blurLevel, setBlurLevel] = useState(0)
  const [modals, setModals] = useState<Array<{ id: string; title?: string; content: ReactNode; onClose: () => void }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const openModal = useCallback((id: string, title: string, content: ReactNode, onClose: () => void) => {
    setBlurLevel(8)
    setModals(prev => {
      const filtered = prev.filter(m => m.id !== id)
      return [...filtered, { id, title, content, onClose }]
    })
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(m => m.id !== id))
    setBlurLevel(0)
  }, [])

  const modalContent = modals.length > 0 ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => closeModal(modals[modals.length - 1].id)} />
      <div className={cn(
        'relative w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl',
        'animate-in fade-in zoom-in-95 duration-200'
      )}>
        {modals[modals.length - 1].title && (
          <div className="flex items-center justify-between p-5 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">{modals[modals.length - 1].title}</h3>
            <button 
              onClick={() => closeModal(modals[modals.length - 1].id)} 
              className="p-2 rounded-xl hover:bg-gray-100/60"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        <div className="p-5">{modals[modals.length - 1].content}</div>
      </div>
    </div>
  ) : null

  return (
    <ModalContext.Provider value={{ blurLevel, setBlurLevel, modals, openModal, closeModal }}>
      {children}
      {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
