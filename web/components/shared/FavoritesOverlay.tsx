'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavorites } from '@/contexts/FavoritesContext'
import { ArrowLeft, Star } from 'lucide-react'
import { MessageCard } from './MessageCard'

const morphSpring = { 
  type: 'spring' as const, 
  stiffness: 400, 
  damping: 30, 
  mass: 1 
}

const itemSpring = { 
  type: 'spring' as const, 
  stiffness: 350, 
  damping: 22 
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: itemSpring
  }
}

interface FavoritesOverlayProps {
  isOpen: boolean
  onClose: () => void
  layoutIdSuffix?: string
}

export function FavoritesOverlay({ 
  isOpen, 
  onClose, 
  layoutIdSuffix = ''
}: FavoritesOverlayProps) {
  const { favoritesCount, favoritesMessages } = useFavorites()
  const router = useRouter()

  const displayCount = favoritesMessages.length > 0 ? favoritesMessages.length : favoritesCount

  const renderList = useMemo(() => {
    if (favoritesMessages.length === 0) return 'empty'
    return favoritesMessages
  }, [favoritesMessages])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="favorites-overlay"
          layoutId={`favorites-shared-bg${layoutIdSuffix}`}
          className="fixed z-50 overflow-hidden bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df]"
          style={{ inset: 0, willChange: 'transform' }}
          initial={{ borderRadius: 40 }}
          animate={{ borderRadius: 0 }}
          exit={{ borderRadius: 40 }}
          transition={morphSpring}
        >
          <motion.div layout="position" className="h-full flex flex-col">
            <header className="p-4 flex items-center gap-3 flex-shrink-0">
              <motion.button
                initial={{ opacity: 0, scale: 0.95, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="p-2 glass rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <motion.div 
                layoutId={`favorites-star${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
              >
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              </motion.div>
              
              <motion.h1 
                layoutId={`favorites-label${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
                className="text-xl font-bold"
              >
                Favorite
              </motion.h1>
              
              <motion.div
                layoutId={`favorites-count${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
                className="ml-auto px-2 py-1 bg-amber-200 rounded-full"
              >
                <span className="text-xs font-medium text-amber-700">{displayCount}</span>
              </motion.div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-[200px] relative">
              {renderList === 'empty' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-10 h-10 text-amber-400" />
                  </div>
                  <p className="text-gray-500">Nu aveți mesaje favorite încă.</p>
                </motion.div>
              )}

              {Array.isArray(renderList) && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {renderList.map((message) => (
                    <motion.div key={message.id} variants={itemVariants}>
                      <MessageCard
                        id={message.id}
                        content={message.content}
                        category={message.category}
                        variant="full"
                        onClick={() => router.push(`/message/${message.id}`)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
