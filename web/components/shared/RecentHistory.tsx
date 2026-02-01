'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

interface HistoryItem {
  id: string
  beneficiary_name: string
  message_id: string | null
  created_at: string
  messages: {
    id: string
    content: string
    category: string
  }[] | null
}

const categoryLabels: Record<string, string> = {
  school_harmony: 'Armonie la școală',
  exams_tests: 'Examene și teste',
  overcoming_failure: 'Depășirea eșecului',
  family_reconnection: 'Reconectare familială',
  personalized: 'Personalizat',
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-rose-100 text-rose-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-violet-100 text-violet-600',
    'bg-cyan-100 text-cyan-600',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Acum câteva secunde'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return minutes === 1 ? 'Acum 1 minut' : `Acum ${minutes} minute`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return hours === 1 ? 'Acum 1 oră' : `Acum ${hours} ore`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return days === 1 ? 'Acum 1 zi' : `Acum ${days} zile`
  }
  return date.toLocaleDateString('ro-RO')
}

function HistoryCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-[32px] flex gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-stone-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function RecentHistory() {
  const { user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('history')
          .select('id, beneficiary_name, message_id, created_at, messages:message_id(id, content, category)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error

        if (data) {
          console.log('Raw data from Supabase:', data)

          const processedData = data.map((item: any) => {
            const rawMsg = item.messages
            const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg
            return {
              ...item,
              messages: msg ? [msg] : null
            }
          }).filter(item => item.messages && item.messages[0]?.content)

          setHistory(processedData)
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user?.id])

  const handleViewAll = () => {
    router.push('/history')
  }

  if (loading) {
    return (
      <div className="mb-0">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-semibold text-stone-800">Istoric Mesaje</h3>
        </div>
        <div className="space-y-3">
          <HistoryCardSkeleton />
          <HistoryCardSkeleton />
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="mb-0">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-semibold text-stone-800">Istoric Mesaje</h3>
        </div>
        <div className="glass-card p-6 rounded-[32px] text-center">
          <p className="text-sm text-stone-500">Nu aveți mesaje trimise încă.</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  return (
    <div className="mb-0">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-lg font-semibold text-stone-800">Istoric Mesaje</h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors flex items-center gap-1"
        >
          Vezi tot
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {history.map((item) => {
          const initial = item.beneficiary_name?.charAt(0).toUpperCase() || '?'
          const avatarColor = getAvatarColor(item.beneficiary_name || '')
          const categoryLabel = categoryLabels[item.messages?.[0]?.category || ''] || item.messages?.[0]?.category

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="glass-card p-4 rounded-[32px] flex gap-4 cursor-pointer border border-white/40 hover:border-white/60 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${avatarColor} flex-shrink-0`}>
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 line-clamp-1 mb-1">
                  &ldquo;{item.messages?.[0]?.content}&rdquo;
                </p>
                <p className="text-xs text-stone-500">
                  {formatTimeAgo(item.created_at)} • {categoryLabel}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
