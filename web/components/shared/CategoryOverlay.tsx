'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useFavorites } from '@/contexts/FavoritesContext'
import { ArrowLeft, Users2, BrainCircuit, Frown, Home, Sparkles } from 'lucide-react'
import { MessageCard } from './MessageCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import type { Message } from '@/types'

const itemSpring = { 
  type: 'spring' as const, 
  stiffness: 350, 
  damping: 22 
}

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
}

interface CategoryData {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgLight: string
}

const categoryMap: Record<string, CategoryData> = {
  'school_harmony': { 
    id: 'school_harmony', 
    title: 'Armonie la școală', 
    description: 'Conflicte, bullying, situații la școală',
    icon: Users2, 
    gradient: 'from-blue-400 to-blue-600',
    bgLight: 'bg-blue-100/60'
  },
  'exams_tests': { 
    id: 'exams_tests', 
    title: 'Examene și teste', 
    description: 'Sprijin înainte de Evaluare',
    icon: BrainCircuit, 
    gradient: 'from-purple-400 to-purple-600',
    bgLight: 'bg-purple-100/60'
  },
  'overcoming_failure': { 
    id: 'overcoming_failure', 
    title: 'Depășirea eșecului', 
    description: 'După note mici sau greșeli',
    icon: Frown, 
    gradient: 'from-orange-400 to-orange-600',
    bgLight: 'bg-orange-100/60'
  },
  'family_reconnection': { 
    id: 'family_reconnection', 
    title: 'Reconectare familială', 
    description: 'După certuri, pentru armonie',
    icon: Home, 
    gradient: 'from-green-400 to-green-600',
    bgLight: 'bg-green-100/60'
  },
  'personalized': { 
    id: 'personalized', 
    title: 'Mesaj personalizat', 
    description: 'Compune mesajul tău',
    icon: Sparkles, 
    gradient: 'from-gray-700 to-gray-900',
    bgLight: 'bg-gray-100/60'
  },
}

interface CategoryOverlayProps {
  categoryId: string | null
  onBack: () => void
}

export function CategoryOverlay({ categoryId, onBack }: CategoryOverlayProps) {
  const { favorites } = useFavorites()
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dataLoadedRef = useRef(false)

  const category = categoryId ? categoryMap[categoryId] : null

  const { registerItem, getAnimateState, getDelay } = useScrollReveal(
    scrollRef,
    messages.length,
    !!categoryId && messages.length > 0,
    {
      forceVisibleCount: 6,
      forceVisibleDuration: 1000,
      rootMargin: '100px',
      threshold: 0.1,
      staggerDelay: 0.03
    }
  )

  useEffect(() => {
    if (categoryId && !dataLoadedRef.current) {
      fetchMessages()
    } else if (!categoryId) {
      setMessages([])
      dataLoadedRef.current = false
    }
  }, [categoryId])

  const fetchMessages = async () => {
    setLoading(true)
    
    try {
      const { data } = await supabase
        .from('messages')
        .select('id, content, category')
        .eq('category', categoryId)
        .limit(50)
      
      if (data) {
        const processed = data.filter((m): m is Message => m && m.id && m.content)
        setMessages(processed)
      }
    } catch (e) {
      console.error('Fetch messages error:', e)
    } finally {
      setLoading(false)
      dataLoadedRef.current = true
    }
  }

  const Icon = category?.icon || Sparkles
  const gradientClass = category?.gradient || 'from-gray-400 to-gray-600'
  const bgLightClass = category?.bgLight || 'bg-gray-100/60'

  const renderList = useMemo(() => {
    if (loading) return null
    if (messages.length === 0) return 'empty'
    return messages
  }, [loading, messages])

  return (
    <AnimatePresence mode="wait">
      {categoryId && category && (
        <>
          <motion.div
            key="category-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            onClick={onBack}
            className="fixed inset-0 bg-black/10 z-40"
          />

          <motion.div
            key="category-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 350, 
              damping: 30 
            }}
            className="fixed z-50 overflow-hidden bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df]"
            style={{ 
              inset: 0, 
              willChange: 'transform'
            }}
          >
            <motion.div layout="position" className="h-full flex flex-col">
              <header className="p-4 pt-8 flex items-center gap-3 flex-shrink-0">
                <motion.button
                  onClick={onBack}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 glass rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                
                <motion.div className={`p-2 rounded-xl ${bgLightClass}`}>
                  <Icon className={`w-5 h-5 ${gradientClass.replace('from-', 'text-').replace(' to-', '-').replace('-600', '-500')}`} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h1 layoutId={`category-title-${categoryId}`} className="text-xl font-bold truncate">
                    {category.title}
                  </motion.h1>
                  <motion.p layoutId={`category-desc-${categoryId}`} className="text-xs text-gray-500 truncate">
                    {category.description}
                  </motion.p>
                </div>
                
                <motion.div
                  className={`px-2 py-1 rounded-full ${bgLightClass}`}
                >
                  <span className="text-xs font-medium">{messages.length || '-'}</span>
                </motion.div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4">
                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={`skeleton-${i}`} className="h-32 bg-white/50 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                )}

                {renderList === 'empty' && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center py-16"
                  >
                    <div className={`w-20 h-20 ${bgLightClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-10 h-10 ${gradientClass.replace('from-', 'text-').replace(' to-', '-').replace('-600', '-500')}`} />
                    </div>
                    <p className="text-gray-500">Nu există mesaje în această categorie.</p>
                  </motion.div>
                )}

                {Array.isArray(renderList) && (
                  <div className="space-y-4">
                    {renderList.map((message, index) => (
                      <motion.div
                        key={message.id}
                        ref={(el) => registerItem(index, el)}
                        variants={itemVariants}
                        initial="hidden"
                        animate={getAnimateState(index)}
                        transition={{
                          ...itemSpring,
                          delay: getDelay(index)
                        }}
                      >
                        <MessageCard
                          id={message.id}
                          content={message.content}
                          category={message.category}
                          variant="full"
                          onClick={() => router.push(`/message/${message.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
