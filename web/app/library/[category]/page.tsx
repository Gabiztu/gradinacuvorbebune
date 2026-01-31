'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ChevronLeft, Heart, ChevronRight, Sparkles, Star, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useFavorites } from '@/contexts/FavoritesContext'
import { FavoritesOverlay } from '@/components/shared/FavoritesOverlay'
import { HistoryOverlay } from '@/components/shared/HistoryOverlay'
import type { Message } from '@/types'

const categoryTitles: Record<string, string> = {
  'school-harmony': 'Armonie la școală',
  'exams-tests': 'Examene și teste',
  'overcoming-failure': 'Depășirea eșecului',
  'family-reconnection': 'Reconectare familială',
  'personalized': 'Mesaj personalizat',
}

const itemVariants = {
  hidden: { opacity: 0.01, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
}

const containerVariants = {
  hidden: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } }
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string
  const { favoritesCount, isFavorite, toggleFavorite } = useFavorites()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyCount, setHistoryCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setIsReady(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsReady(false)
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      fetchHistoryCount()
    }
  }, [mounted])

  const fetchHistoryCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count } = await supabase
      .from('history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setHistoryCount(count || 0)
  }

  const categoryKey = categoryId.replace('-', '_')

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await (supabase
        .from('messages')
        .select('*')
        .eq('category', categoryKey) as any)
        .eq('is_active', true)
        .order('created_at', { ascending: 'desc' })

      if (error) {
        console.error('Error fetching messages:', error)
        toast.error('Nu s-au putut încărca mesajele')
      } else if (data) {
        setMessages(data as Message[])
      }

      setLoading(false)
    }

    fetchMessages()
  }, [categoryKey])

  if (!mounted) return null

  const layoutIdSuffix = `-${categoryId}`
  const displayCategoryTitle = categoryTitles[categoryId] || 'Mesaje'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df]">
      <header className="sticky top-0 z-10 glass border-b border-white/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/library" className="p-2 -ml-2 hover:bg-white/50 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {displayCategoryTitle}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              layoutId={`favorites-shared-bg${layoutIdSuffix}`}
              onClick={() => setShowFavorites(true)}
              style={{ borderRadius: 40 }}
              className="flex items-center gap-1.5 px-3 py-1.5 glass text-amber-600 overflow-hidden"
            >
              <motion.div layoutId={`favorites-star${layoutIdSuffix}`}>
                <Star className="w-4 h-4" />
              </motion.div>
              <motion.span layoutId={`favorites-label${layoutIdSuffix}`} className="text-sm">Favorite</motion.span>
              {favoritesCount > 0 && (
                <motion.span
                  layoutId={`favorites-count${layoutIdSuffix}`}
                  className="px-1.5 py-0.5 bg-amber-200 rounded-full text-xs font-bold"
                >
                  {favoritesCount}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              layoutId={`history-shared-bg${layoutIdSuffix}`}
              onClick={() => setShowHistory(true)}
              style={{ borderRadius: 40 }}
              className="flex items-center gap-1.5 px-3 py-1.5 glass text-gray-700 overflow-hidden"
            >
              <motion.div layoutId={`history-clock${layoutIdSuffix}`}>
                <History className="w-4 h-4" />
              </motion.div>
              <motion.span layoutId={`history-label${layoutIdSuffix}`} className="text-sm font-medium">Istoric</motion.span>
              {historyCount > 0 && (
                <motion.span
                  layoutId={`history-count${layoutIdSuffix}`}
                  className="px-1.5 py-0.5 bg-gray-200 rounded-full text-xs font-bold"
                >
                  {historyCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="p-4 space-y-4 pb-28">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="text-center py-12" padding="lg">
              <div className="w-20 h-20 bg-gray-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">Nu există mesaje în această categorie încă.</p>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={mounted ? 'mounted' : 'initial'}
            variants={containerVariants}
            initial="hidden"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => {
                const messageIsFavorite = isFavorite(message.id)
                
                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial="hidden"
                    animate={index < 6 ? (isReady ? "visible" : "hidden") : undefined}
                    whileInView={index >= 6 ? "visible" : undefined}
                    viewport={{ 
                      root: scrollRef, 
                      once: false, 
                      amount: 0.05,
                      margin: "0px 0px -20px 0px"
                    }}
                    variants={itemVariants}
                    transition={{ 
                      type: 'spring' as const,
                      stiffness: 260, 
                      damping: 32, 
                      delay: index < 6 ? index * 0.06 : 0
                    }}
                  >
                    <Card
                      className={cn(
                        'relative overflow-hidden transition-all duration-300',
                        'hover:shadow-xl hover:scale-[1.01]'
                      )}
                      padding="lg"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="relative z-10">
                        <p className="text-gray-800 text-lg leading-relaxed pr-12 mb-6">
                          {message.content}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                            <button
                              onClick={() => toggleFavorite(message.id, message)}
                            className={cn(
                              'p-3 rounded-xl transition-all duration-300',
                              messageIsFavorite
                                ? 'bg-amber-100/80 text-amber-600'
                                : 'bg-gray-100/60 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                            )}
                          >
                            <Heart
                              className={cn(
                                'w-5 h-5 transition-all duration-300',
                                messageIsFavorite && 'fill-current animate-heart'
                              )}
                            />
                          </button>

                          <Link
                            href={`/message/${message.id}`}
                            className="flex-1 group flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
                          >
                            <span>Trimite mesajul</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <FavoritesOverlay
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        layoutIdSuffix={layoutIdSuffix}
      />

      <HistoryOverlay
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        initialCount={historyCount}
        layoutIdSuffix={layoutIdSuffix}
      />
    </div>
  )
}
