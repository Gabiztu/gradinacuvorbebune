'use client'

import { forwardRef, HTMLAttributes, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
  title?: string
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen = false, onClose, title, children, size = 'md', id, className, ...props }, ref) => {
    const [localOpen, setLocalOpen] = useState(isOpen)

    useEffect(() => {
      setLocalOpen(isOpen)
    }, [isOpen])

    if (!localOpen) return null

    const handleClose = () => {
      setLocalOpen(false)
      onClose?.()
    }

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    }

    return (
      <div className={cn('fixed inset-0 z-[100] flex items-center justify-center p-4', className)}>
        <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
        <div
          ref={ref}
          className={cn(
            'relative w-full bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl',
            'transform transition-all duration-300',
            'scale-100 opacity-100',
            sizes[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100/60" aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
          <div className="p-5">{children}</div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'
