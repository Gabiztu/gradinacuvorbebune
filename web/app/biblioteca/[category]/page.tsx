'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Message, MessageCategory } from '@/types'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useSearchParams } from 'next/navigation'

const categories: Record<string, { title: string; description: string; color: string }> = {
  school_harmony: {
    title: 'Armonie la școală',
    description: 'Conflicte cu colegii, anxietate socială',
    color: 'border-l-blue-400',
  },
  exams_tests: {
    title: 'Examene și teste',
    description: 'Încurajare înainte de teste, focus',
    color: 'border-l-violet-400',
  },
  family_reconnection: {
    title: 'Reconectare familială',
    description: 'Timp împreună, seri liniștite',
    color: 'border-l-rose-400',
  },
  overcoming_failure: {
    title: 'Depășirea eșecului',
    description: 'După o notă mică sau o pierdere',
    color: 'border-l-orange-400',
  },
}

const categoryLabels: Record<string, string> = {
  school_harmony: 'Armonie la școală',
  exams_tests: 'Examene și teste',
  family_reconnection: 'Reconectare familială',
  overcoming_failure: 'Depășirea eșecului',
  personalized: 'Personalizat',
}

const categoryTagColors: Record<string, { border: string; text: string; bg: string }> = {
  school_harmony: { border: 'border-blue-400', text: 'text-blue-600', bg: 'bg-blue-50' },
  exams_tests: { border: 'border-violet-400', text: 'text-violet-600', bg: 'bg-violet-50' },
  family_reconnection: { border: 'border-rose-400', text: 'text-rose-600', bg: 'bg-rose-50' },
  overcoming_failure: { border: 'border-orange-400', text: 'text-orange-600', bg: 'bg-orange-50' },
  personalized: { border: 'border-stone-300', text: 'text-stone-500', bg: 'bg-stone-50' },
}

function getTagColor(category: string) {
  return categoryTagColors[category] || categoryTagColors.personalized
}

function MessageCard({ message, beneficiaryId }: { message: Message; beneficiaryId?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [initialRender, setInitialRender] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setInitialRender(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const favorite = isFavorite(message.id)

  return (
    <motion.div
      initial={initialRender ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-4 rounded-2xl border-l-4 ${categories[message.category as string]?.color || 'border-l-amber-300'} flex flex-col`}
    >
      <p className="text-sm text-stone-700 mb-3 line-clamp-4 flex-1">{message.content}</p>
      <div className="flex justify-end items-center mt-2">
        <div className="flex gap-2">
          <Link
            href={`/message/personalize/${message.id}${beneficiaryId ? `?beneficiaryId=${beneficiaryId}` : ''}`}
            className="text-stone-400 hover:text-stone-800 transition-colors"
          >
            <iconify-icon icon="solar:plain-linear" width="16" />
          </Link>
          <button
            onClick={() => toggleFavorite(message.id, { id: message.id, content: message.content, category: message.category })}
            className={`transition-colors ${favorite ? 'text-amber-400' : 'text-stone-400 hover:text-amber-400'}`}
          >
            <Star className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function MessageCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 flex flex-col animate-pulse">
      <div className="h-16 bg-stone-200 rounded mb-3" />
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 w-16 bg-stone-200 rounded" />
        <div className="h-4 w-8 bg-stone-200 rounded" />
      </div>
    </div>
  )
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params)
  const category = resolvedParams.category
  const categoryInfo = categories[category]
  const searchParams = useSearchParams()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const beneficiaryId = searchParams.get('beneficiaryId')

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('category', category as MessageCategory)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data) {
        setMessages(data as Message[])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [category])

  if (!categoryInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-semibold text-stone-800 mb-2">Categorie negăsită</h2>
        <Link href="/biblioteca" className="text-stone-500 hover:text-stone-700">
          Înapoi la bibliotecă
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/biblioteca"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-600 hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-800">
            {categoryInfo.title}.
          </h2>
          <p className="text-stone-500 font-light">{categoryInfo.description}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <MessageCardSkeleton key={i} />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <iconify-icon icon="solar:notes-linear" class="text-stone-400" width="32" />
          </div>
          <p className="text-stone-500 mb-4">Nu există mesaje în această categorie.</p>
          <Link
            href="/biblioteca"
            className="px-6 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium"
          >
            Înapoi la bibliotecă
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} beneficiaryId={beneficiaryId || undefined} />
          ))}
        </div>
      )}
    </div>
  )
}
