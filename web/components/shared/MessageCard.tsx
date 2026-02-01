'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Message, MessageCategory } from '@/types'
import { MagicDust } from '@/components/ui/MagicDust'
import { useFavorites } from '@/contexts/FavoritesContext'

interface MessageCardProps {
  id: string
  content: string
  category: MessageCategory
  isFavorite?: boolean
  variant?: 'compact' | 'full'
  onFavoriteToggle?: () => void
  onClick?: () => void
  className?: string
}

export function MessageCard({
  id,
  content,
  category,
  isFavorite: externalIsFavorite,
  variant = 'compact',
  onClick,
  className,
}: MessageCardProps) {
  const { isFavorite: isContextFavorite, toggleFavorite } = useFavorites()
  const [favoriteTrigger, setFavoriteTrigger] = useState(false)
  const [favoritePosition, setFavoritePosition] = useState({ x: 0, y: 0 })

  const isFavorite = externalIsFavorite !== undefined ? externalIsFavorite : isContextFavorite(id)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setFavoritePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setFavoriteTrigger(true)
    await toggleFavorite(id, { id, content, category })
  }

  if (variant === 'compact') {
    return (
      <motion.div
        layoutId={`message-card-${id}`}
        layout
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-white/70 backdrop-blur-xl border border-white/50',
          'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
          'cursor-pointer',
          className
        )}
        style={{ minHeight: '140px' }}
      >
        <motion.div
          layoutId={`star-container-${id}`}
          className="absolute top-3 right-3 z-10"
        >
          <motion.button
            layoutId={`star-${id}`}
            onClick={handleFavoriteClick}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              isFavorite
                ? 'bg-amber-100 text-amber-500'
                : 'bg-white/50 text-gray-400 hover:text-amber-500'
            )}
          >
            <Star
              className={cn(
                'w-4 h-4 transition-all duration-200',
                isFavorite && 'fill-amber-400 text-amber-400'
              )}
            />
          </motion.button>
        </motion.div>

        <motion.div
          layoutId={`content-${id}`}
          className="p-4 pr-12 h-full flex flex-col justify-end"
        >
          <motion.p
            layoutId={`text-${id}`}
            className="text-gray-800 text-sm leading-relaxed line-clamp-3"
          >
            {content}
          </motion.p>
        </motion.div>

        <MagicDust
          trigger={favoriteTrigger}
          x={favoritePosition.x}
          y={favoritePosition.y}
          color="#f59e0b"
          onComplete={() => setFavoriteTrigger(false)}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      layoutId={`message-card-${id}`}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/70 backdrop-blur-xl border border-white/50',
        'hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      <motion.div
        layoutId={`star-container-${id}`}
        className="absolute top-0 right-0 z-10 p-3"
      >
        <motion.button
          layoutId={`star-${id}`}
          onClick={handleFavoriteClick}
          className={cn(
            'p-3 rounded-full transition-all duration-200',
            isFavorite
              ? 'bg-amber-100 text-amber-500'
              : 'bg-white/50 text-gray-400 hover:text-amber-500'
          )}
        >
          <Star
            className={cn(
              'w-5 h-5 transition-all duration-200',
              isFavorite && 'fill-amber-400 text-amber-400'
            )}
          />
        </motion.button>
      </motion.div>

      <div className="p-5 pr-14">
        <motion.p
          layoutId={`text-${id}`}
          className="text-gray-800 text-base leading-relaxed"
        >
          {content}
        </motion.p>
      </div>

      <MagicDust
        trigger={favoriteTrigger}
        x={favoritePosition.x}
        y={favoritePosition.y}
        color="#f59e0b"
        onComplete={() => setFavoriteTrigger(false)}
      />
    </motion.div>
  )
}
