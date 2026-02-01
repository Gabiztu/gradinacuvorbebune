'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import MagicBento from '@/components/bento/MagicBento'
import { FavoritesOverlay } from '@/components/shared/FavoritesOverlay'
import { HistoryOverlay } from '@/components/shared/HistoryOverlay'
import { CategoryOverlay } from '@/components/shared/CategoryOverlay'
import type { Message } from '@/types'

interface HistoryItem {
  id: string
  messageId: string
  beneficiaryName: string
  content: string
  category: string
}

function processHistoryData(data: any[]): HistoryItem[] {
  if (!data) return []
  
  const seen = new Set<string>()
  const processed: HistoryItem[] = []
  
  for (const item of data) {
    if (!item.messages?.[0]?.id || !item.messages?.[0]?.content) continue
    
    const messageId = item.messages[0].id
    if (seen.has(messageId)) continue
    seen.add(messageId)
    
    processed.push({
      id: item.id,
      messageId: messageId,
      beneficiaryName: item.beneficiary_name || 'Cineva drag',
      content: item.messages[0].content,
      category: item.messages[0].category
    })
  }
  
  return processed
}

const libraryVariants = {
  normal: { 
    x: '0%',
    scale: 1
  },
  categoryOpen: { 
    x: '-15%',
    scale: 0.96,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      scale: { type: 'spring' as const, stiffness: 300, damping: 30 }
    }
  }
}

export default function LibraryPage() {
  const { user } = useAuth()
  const { favoritesCount } = useFavorites()
  const supabase = createClient()
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])
  const [historyCount, setHistoryCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    school_harmony: 0,
    exams_tests: 0,
    overcoming_failure: 0,
    family_reconnection: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      fetchHistoryCount()
      fetchCategoryCounts()
    }
  }, [mounted, user])

  const fetchCategoryCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('category')
        .not('category', 'is', null)

      if (error) {
        console.error('Fetch category counts error:', error)
        return
      }

      const counts: Record<string, number> = {
        school_harmony: 0,
        exams_tests: 0,
        overcoming_failure: 0,
        family_reconnection: 0,
      }

      data?.forEach((item: any) => {
        const category = item.category
        if (category && counts.hasOwnProperty(category)) {
          counts[category]++
        }
      })

      setCategoryCounts(counts)
    } catch (e) {
      console.error('Fetch category counts error:', e)
    }
  }

  const fetchHistoryCount = async () => {
    try {
      const { data } = await supabase
        .from('history')
        .select('message_id')
        .eq('user_id', user?.id)
      
      if (data) {
        const uniqueMessageIds = new Set(data.map(i => i.message_id))
        setHistoryCount(uniqueMessageIds.size)
      }
    } catch (e) {
      console.error('Fetch history count error:', e)
      setHistoryCount(0)
    }
  }

  const prefetchHistory = async () => {
    if (historyData.length > 0) return
    try {
      const { data } = await supabase
        .from('history')
        .select('id, beneficiary_name, message_id, messages:message_id(id, content, category)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (data) {
        const processed = processHistoryData(data)
        setHistoryData(processed)
      }
    } catch (e) {
      console.log('Prefetch history skipped')
    }
  }

  if (!mounted) return null

  const layoutIdSuffix = ''

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <motion.div
        className="relative z-10 flex-1 flex flex-col"
        variants={libraryVariants}
        animate={selectedCategory ? 'categoryOpen' : 'normal'}
        style={{ willChange: 'transform' }}
      >
        <div className="flex-1 flex flex-col">
          <header className="p-3 pt-3 flex-shrink-0 glass border-b border-white/40 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <motion.button
                layoutId={`favorites-shared-bg${layoutIdSuffix}`}
                onClick={() => setShowFavorites(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/30 text-amber-600"
              >
                <motion.div layoutId={`favorites-star${layoutIdSuffix}`}>
                  <Star className="w-4 h-4" />
                </motion.div>
                {favoritesCount > 0 && (
                  <motion.span
                    layoutId={`favorites-count${layoutIdSuffix}`}
                    className="px-1.5 py-0.5 bg-amber-200/80 backdrop-blur-sm rounded-full text-xs font-bold"
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
            
            <div className="text-center">
              <h1 className="text-[15px] font-bold text-gray-900 mb-0.5">Biblioteca</h1>
              <p className="text-gray-500 text-[10px]">Alege categoria pentru mesajul tău</p>
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.button
                layoutId={`history-shared-bg${layoutIdSuffix}`}
                onClick={() => setShowHistory(true)}
                onMouseEnter={prefetchHistory}
                onTouchStart={prefetchHistory}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/30 text-gray-700"
              >
                <motion.div layoutId={`history-clock${layoutIdSuffix}`}>
                  <History className="w-4 h-4" />
                </motion.div>
                {historyCount > 0 && (
                  <motion.span
                    layoutId={`history-count${layoutIdSuffix}`}
                    className="px-1.5 py-0.5 bg-gray-200/80 backdrop-blur-sm rounded-full text-xs font-bold"
                  >
                    {historyCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <MagicBento
              enableStars={true}
              enableSpotlight={true}
              enableTilt={true}
              glowColor="34, 197, 94"
              clickEffect={true}
              onCategoryClick={setSelectedCategory}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedCategory && (
          <CategoryOverlay
            categoryId={selectedCategory}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </AnimatePresence>

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
        prefetchedData={historyData}
      />

      <div className="safe-area-inset-bottom flex-shrink-0" />
    </div>
  )
}
