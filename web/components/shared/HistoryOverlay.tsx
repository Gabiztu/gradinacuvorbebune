'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Clock } from 'lucide-react'

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

interface HistoryItem {
  id: string
  messageId: string
  beneficiaryName: string
  content: string
  category: string
}

interface HistoryOverlayProps {
  isOpen: boolean
  onClose: () => void
  initialCount?: number
  layoutIdSuffix?: string
  prefetchedData?: HistoryItem[]
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
      category: item.messages.category
    })
  }
  
  return processed
}

export function HistoryOverlay({ 
  isOpen, 
  onClose, 
  initialCount = 0,
  layoutIdSuffix = '',
  prefetchedData = []
}: HistoryOverlayProps) {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasFullData, setHasFullData] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('history')
        .select('id, beneficiary_name, message_id, messages:message_id(id, content, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      if (data) {
        const processed = processHistoryData(data)
        setHistory(processed)
        setHasFullData(true)
      }
    } catch (e) {
      console.error('Fetch history error:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (!isOpen) {
      setLoading(true)
      setHasFullData(false)
      return
    }

    if (!user) return

    if (prefetchedData.length > 0 && !hasFullData) {
      setHistory(prefetchedData)
      setLoading(false)
      
      if (prefetchedData.length < initialCount) {
        fetchHistory()
      } else {
        setHasFullData(true)
      }
    } else if (!hasFullData) {
      fetchHistory()
    }
  }, [isOpen, user, prefetchedData, initialCount, hasFullData, fetchHistory])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setHistory([])
        setHasFullData(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const displayCount = history.length > 0 ? history.length : initialCount

  const renderList = useMemo(() => {
    if (loading && history.length === 0) return null
    if (!loading && history.length === 0) return 'empty'
    return history
  }, [loading, history])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="history-overlay"
          layoutId={`history-shared-bg${layoutIdSuffix}`}
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
                layoutId={`history-clock${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
              >
                <Clock className="w-5 h-5 text-stone-500" />
              </motion.div>
              
              <motion.h1 
                layoutId={`history-label${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
                className="text-xl font-semibold tracking-tight text-stone-800"
              >
                Istoric
              </motion.h1>
              
              <motion.div
                layoutId={`history-count${layoutIdSuffix}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.15, ease: 'easeOut' }}
                className="ml-auto px-2 py-1 bg-stone-200 rounded-full"
              >
                <span className="text-xs font-medium text-stone-700">
                  {displayCount}
                </span>
              </motion.div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-[200px] relative">
              {loading && history.length === 0 && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={`skeleton-${i}`} 
                      className="h-24 bg-white/50 rounded-2xl animate-pulse" 
                    />
                  ))}
                </div>
              )}

              {renderList === 'empty' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-stone-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-stone-400" />
                  </div>
                  <p className="text-stone-500">Nu aveți mesaje trimise încă.</p>
                </motion.div>
              )}

              {Array.isArray(renderList) && (
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {renderList.map((item) => (
                    <motion.div key={item.messageId} variants={itemVariants}>
                      <div className="glass-card p-4 rounded-[32px] flex gap-4 border border-white/40 hover:border-white/60 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 line-clamp-1 mb-1">
                            &ldquo;{item.content}&rdquo;
                          </p>
                          <p className="text-xs text-stone-500">
                            Trimis către <span className="font-medium text-stone-700">{item.beneficiaryName}</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {loading && history.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
