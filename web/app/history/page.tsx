'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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

const categoryColors: Record<string, string> = {
  school_harmony: 'border-l-blue-400',
  exams_tests: 'border-l-violet-400',
  overcoming_failure: 'border-l-orange-400',
  family_reconnection: 'border-l-rose-400',
  personalized: 'border-l-amber-300',
}

function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.personalized
}

function formatDate(dateString: string): string {
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

function HistoryCard({ item }: { item: HistoryItem }) {
  const categoryColor = getCategoryColor(item.messages?.[0]?.category || 'personalized')
  const categoryLabel = categoryLabels[item.messages?.[0]?.category || 'personalized'] || item.messages?.[0]?.category

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-4 rounded-2xl border-l-4 ${categoryColor} flex flex-col`}
    >
      <p className="text-sm text-stone-700 mb-3 line-clamp-4 flex-1">
        &ldquo;{item.messages?.[0]?.content}&rdquo;
      </p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-stone-500">
          {formatDate(item.created_at)} • {categoryLabel}
        </span>
        <span className="text-xs text-stone-500">
          → {item.beneficiary_name}
        </span>
      </div>
    </motion.div>
  )
}

function HistoryCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 flex flex-col animate-pulse">
      <div className="h-16 bg-stone-200 rounded mb-3" />
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 w-24 bg-stone-200 rounded" />
        <div className="h-4 w-16 bg-stone-200 rounded" />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('history')
          .select('id, beneficiary_name, message_id, created_at, messages:message_id(id, content, category)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        if (data) {
          const processedData = data.map((item: any) => {
            const rawMsg = item.messages
            const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg
            return {
              ...item,
              messages: msg ? [msg] : null
            }
          }).filter((item: any) => item.messages && item.messages[0]?.content)

          setHistory(processedData)
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-600 hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-800">
            Istoric.
          </h2>
          <p className="text-stone-500 font-light">Mesajele tale trimise</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-stone-500 mb-4">Nu ai trimis mesaje încă.</p>
          <Link
            href="/biblioteca"
            className="px-6 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium"
          >
            Trimite primul mesaj
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
