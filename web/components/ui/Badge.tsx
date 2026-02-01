'use client'

import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'glass'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100/80 backdrop-blur-sm text-gray-800 border-gray-200/50',
      success: 'bg-green-100/80 backdrop-blur-sm text-green-800 border-green-200/50',
      warning: 'bg-amber-100/80 backdrop-blur-sm text-amber-800 border-amber-200/50',
      error: 'bg-red-100/80 backdrop-blur-sm text-red-800 border-red-200/50',
      purple: 'bg-purple-100/80 backdrop-blur-sm text-purple-800 border-purple-200/50',
      glass: 'bg-white/40 backdrop-blur-sm text-gray-700 border-white/30',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs rounded-full',
      md: 'px-2.5 py-1 text-sm rounded-full',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
