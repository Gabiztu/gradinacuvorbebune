'use client'

import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'purple' | 'orange' | 'green' | 'dark' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  glow?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/80 backdrop-blur-xl border-white/40 shadow-soft',
      glass: 'bg-white/60 backdrop-blur-2xl border-white/50 shadow-medium',
      blue: 'bg-blue-100/80 backdrop-blur-xl border-blue-200/50 shadow-blue-500/10',
      purple: 'bg-purple-100/80 backdrop-blur-xl border-purple-200/50 shadow-purple-500/10',
      orange: 'bg-orange-100/80 backdrop-blur-xl border-orange-200/50 shadow-orange-500/10',
      green: 'bg-green-100/80 backdrop-blur-xl border-green-200/50 shadow-green-500/10',
      dark: 'bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-medium',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all duration-300',
          variants[variant],
          paddings[padding],
          interactive && 'hover:shadow-large hover:scale-[1.02] hover:-translate-y-1 cursor-pointer',
          glow && 'shadow-glow animate-pulse-glow',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
