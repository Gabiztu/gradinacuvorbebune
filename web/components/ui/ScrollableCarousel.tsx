'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollableCarouselProps {
  children: ReactNode
  className?: string
  showArrows?: boolean
}

export function ScrollableCarousel({ children, className, showArrows = true }: ScrollableCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Left Arrow - Desktop Only */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg border border-stone-200 items-center justify-center text-stone-600 hover:bg-white hover:text-stone-800 transition-all opacity-0 group-hover:opacity-100 active:scale-95"
        aria-label="Derulează la stânga"
      >
        <iconify-icon icon="solar:alt-arrow-left-linear" width="20" />
      </button>

      {/* Right Arrow - Desktop Only */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg border border-stone-200 items-center justify-center text-stone-600 hover:bg-white hover:text-stone-800 transition-all opacity-0 group-hover:opacity-100 active:scale-95"
        aria-label="Derulează la dreapta"
      >
        <iconify-icon icon="solar:alt-arrow-right-linear" width="20" />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar scroll-smooth"
      >
        {children}
      </div>
    </div>
  )
}
