'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ScrollableCarousel } from '@/components/ui/ScrollableCarousel'
import Link from 'next/link'
import type { Message, MessageCategory } from '@/types'
import { Plus, X, Star, User } from 'lucide-react'

const categories = [
  {
    key: 'school_harmony',
    title: 'Armonie la școală',
    description: 'Conflicte cu colegii, anxietate socială',
    icon: 'solar:backpack-linear',
    gradient: 'from-blue-400 to-blue-600',
    bgLight: 'bg-blue-50',
    borderColor: 'hover:border-blue-200',
  },
  {
    key: 'exams_tests',
    title: 'Examene și teste',
    description: 'Încurajare înainte de teste, focus',
    icon: 'solar:notes-linear',
    gradient: 'from-violet-400 to-violet-600',
    bgLight: 'bg-violet-50',
    borderColor: 'hover:border-violet-200',
  },
  {
    key: 'family_reconnection',
    title: 'Reconectare familială',
    description: 'Timp împreună, seri liniștite',
    icon: 'solar:home-smile-linear',
    gradient: 'from-rose-400 to-rose-600',
    bgLight: 'bg-rose-50',
    borderColor: 'hover:border-rose-200',
  },
  {
    key: 'overcoming_failure',
    title: 'Depășirea eșecului',
    description: 'După o notă mică sau o pierdere',
    icon: 'solar:cloud-sun-linear',
    gradient: 'from-orange-400 to-orange-600',
    bgLight: 'bg-orange-50',
    borderColor: 'hover:border-orange-200',
  },
]

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

type Category = typeof categories[number]

function CategoryCard({ category, beneficiaryId }: { category: Category; beneficiaryId?: string | null }) {
  return (
    <Link href={`/biblioteca/${category.key}${beneficiaryId ? `?beneficiaryId=${beneficiaryId}` : ''}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'glass-card p-5 rounded-2xl text-left cursor-pointer transition-all',
          category.borderColor
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', category.bgLight)}>
            <iconify-icon icon={category.icon} width="22" />
          </div>
          <iconify-icon icon="solar:alt-arrow-right-linear" class="text-stone-300" width="20" />
        </div>
        <h4 className="font-medium text-stone-800">{category.title}</h4>
        <p className="text-xs text-stone-500 mt-1 font-light">{category.description}</p>
      </motion.div>
    </Link>
  )
}

function FavoritesCarousel() {
  const { favoritesMessages, toggleFavorite, loading } = useFavorites()
  const [pendingUnfavorite, setPendingUnfavorite] = useState<string | null>(null)
  const [initialRender, setInitialRender] = useState(true)

  useEffect(() => {
    if (!loading && initialRender) {
      const timer = setTimeout(() => setInitialRender(false), 100)
      return () => clearTimeout(timer)
    }
  }, [loading, initialRender])

  if (loading) {
    return (
      <ScrollableCarousel>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-w-[260px] glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 flex flex-col animate-pulse"
          >
            <div className="h-16 bg-stone-200 rounded mb-3" />
            <div className="flex justify-between items-center mt-2">
              <div className="h-4 w-16 bg-stone-200 rounded" />
              <div className="h-4 w-8 bg-stone-200 rounded" />
            </div>
          </div>
        ))}
      </ScrollableCarousel>
    )
  }

  if (favoritesMessages.length === 0) {
    return (
      <ScrollableCarousel>
        <div className="min-w-[260px] glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 opacity-50">
          <p className="text-sm text-stone-600 mb-3 line-clamp-2 italic">
            Adaugă mesaje la favorite pentru a le vedea aici.
          </p>
          <span className="text-[10px] bg-stone-100 px-2 py-1 rounded text-stone-500">Sfaturi</span>
        </div>
      </ScrollableCarousel>
    )
  }

  const handleToggle = async (messageId: string, message: typeof favoritesMessages[0]) => {
    setPendingUnfavorite(messageId)
    await toggleFavorite(message.id, { id: message.id, content: message.content, category: message.category })
    setPendingUnfavorite(null)
  }

  return (
    <ScrollableCarousel className="group">
      <AnimatePresence mode="popLayout">
        {favoritesMessages.slice(0, 10).map((message) => (
          <motion.div
            key={message.id}
            layout
            initial={initialRender ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="min-w-[260px] glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 flex flex-col"
          >
            <p className="text-sm text-stone-700 mb-3 line-clamp-3 flex-1">{message.content}</p>
              <div className="flex justify-between items-center mt-2">
              <span className={`text-[10px] px-2 py-1 rounded-full border ${getTagColor(message.category).border} ${getTagColor(message.category).text} ${getTagColor(message.category).bg}`}>
                {categoryLabels[message.category] || message.category.replace(/_/g, ' ')}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/message/personalize/${message.id}`}
                  className="text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <iconify-icon icon="solar:plain-linear" width="16" />
                </Link>
                <button
                  onClick={() => handleToggle(message.id, message)}
                  className="text-amber-400 transition-colors"
                >
                  <Star
                    className="w-4 h-4"
                    fill={pendingUnfavorite === message.id ? 'none' : 'currentColor'}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </ScrollableCarousel>
  )
}

function CustomMessageModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const { selectedBeneficiary } = useBeneficiary()

  const handleCopy = () => {
    if (!message.trim()) return
    navigator.clipboard.writeText(message)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 overscroll-none"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg w-full bg-[#FAFAF9] rounded-t-3xl md:rounded-3xl p-6 shadow-xl pb-24 md:pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-stone-800">Mesaj Personalizat</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedBeneficiary && (
              <p className="text-sm text-stone-500 mb-4">
                Scrie un mesaj pentru <span className="font-medium text-stone-700">{selectedBeneficiary.first_name}</span>
              </p>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrie mesajul tău aici..."
              className="w-full h-40 p-4 rounded-xl bg-white/60 border border-white focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none text-stone-700"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-300 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleCopy}
                disabled={!message.trim()}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-50 font-medium text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                Trimite
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function BibliotecaContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const searchParams = useSearchParams()
  const beneficiaryId = searchParams.get('beneficiaryId')
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data) {
        setMessages(data as Message[])
      }
      setLoadingMessages(false)
    }

    fetchMessages()
  }, [])

  const searchResults = searchQuery.trim() 
    ? messages.filter(msg => {
        const normalizedText = (text: string) => text
          .toLowerCase()
          .replace(/[ăâàá]/g, 'a')
          .replace(/[îìíï]/g, 'i')
          .replace(/[șş]/g, 's')
          .replace(/[țţ]/g, 't')
          .replace(/[ëéèê]/g, 'e')
          .replace(/[öôóò]/g, 'o')
          .replace(/[üûúù]/g, 'u')
        
        const query = normalizedText(searchQuery)
        
        const contentMatch = normalizedText(msg.content).includes(query)
        const categoryMatch = normalizedText(categoryLabels[msg.category] || '').includes(query)
        const categoryDescMatch = normalizedText(categories.find(c => c.key === msg.category)?.description || '').includes(query)
        
        const keywords: Record<string, string[]> = {
          'anxietate': ['anxietate', 'anxios', 'nervos', 'teamă', 'frică', 'panica', 'ngrijorat', 'presat', 'stress', 'tensiune', 'nelinist', 'alarmat'],
          'frica': ['frică', 'teama', 'spaima', 'panica', 'teme', 'ngrijorat', 'infricosat', 'curaj', 'curajos'],
          'tristete': ['trist', 'triste', 'tristete', 'melancolic', 'down', 'deprimat', 'dezamagit', 'nedumerit', 'capat'],
          'fericire': ['fericit', 'fericire', 'bucurie', 'bucuros', 'vesel', 'optimist', 'entuziasmat', 'multumit', 'satisfacut'],
          'success': ['succes', 'success', 'reusit', 'reușită', 'victorie', 'castig', 'performanta', 'realizare', 'realizari'],
          'esec': ['eșec', 'esec', 'fracas', 'esuat', 'nereusit', 'pierdere', 'invins', 'defaitist', 'lipsit'],
          'scoala': ['școal', 'scoala', 'scoală', 'clasa', 'profesor', 'note', 'test', 'examen', 'tema', 'invatare', 'educatie'],
          'colegi': ['coleg', 'colegi', 'prieten', 'prieteni', 'social', 'relatie', 'relatii', 'grup', 'acceptare'],
          'familie': ['famil', 'familia', 'familie', 'parinti', 'părinți', 'mama', 'tata', 'frate', 'soră', 'acasă', 'home'],
          'examen': ['examen', 'examene', 'test', 'teza', 'evaluare', 'nota', 'note', 'performanta', 'presiune', 'stres'],
          'concentrare': ['concentrare', 'concentrat', 'atentie', 'focalizare', 'focus', 'studiu', 'invatare', 'memorare'],
          'motivare': ['motivare', 'motivat', 'inspirare', 'inspirat', 'encouragement', 'incentive', 'dovada', 'susținere'],
          'suport': ['suport', 'ajutor', 'asistenta', 'mâna', 'apoi', 'alaturi', 'langa', 'solidaritate'],
          'curaj': ['curaj', 'curajos', 'indrazneala', 'vitejie', 'tare', 'putere', 'forta', 'determinare', 'puternic'],
          'liniste': ['liniste', 'liniște', 'calm', 'pacate', 'relaxare', 'relaxat', 'odihna', 'respirație', 'meditatie'],
          'acceptare': ['acceptare', 'acceptat', 'tolerance', 'tolerat', 'intelegere', 'inteles', 'împăcare', 'pace'],
          'dezvoltare': ['dezvoltare', 'evolutie', 'crestere', 'improvement', 'progress', 'avansare', 'maturity', 'maturizare'],
          'incredere': ['încredere', 'incredere', 'increzator', 'increzătoare', 'sigur', 'siguranta', 'confidence', 'faith'],
          'comunicare': ['comunicare', 'comunicat', 'vorbire', 'dialog', 'discutie', 'conversatie', 'exprimare'],
          'emotie': ['emotie', 'emoție', 'sentiment', 'sentimente', 'feeling', 'feelings', 'stare', 'vibratie'],
          'copil': ['copil', 'copii', 'copilaresc', 'adolescent', 'tanar', 'tânăr', 'minor', '少年', ' enfant'],
          'parinte': ['parinte', 'părinte', 'parinti', 'părinți', 'parental', 'mama', 'tata', 'mother', 'father'],
          'presiune': ['presiune', 'pressure', 'stres', 'stress', 'tensiune', 'incordare', 'obligatie', 'așteptare'],
          'recuperare': ['recuperare', 'recupera', 'revenire', 'vindecare', 'healing', 'restabilire', 'reabilitare'],
          'valente': ['valoare', 'valori', 'valorile', 'dignitate', 'respect', 'importanta', 'semnificatie'],
        }

        const expandedQuery = [query]
        for (const [key, synonyms] of Object.entries(keywords)) {
          if (key.includes(query) || synonyms.some(s => normalizedText(s).includes(query))) {
            expandedQuery.push(...synonyms.map(s => normalizedText(s)))
          }
        }

        return contentMatch || categoryMatch || categoryDescMatch || expandedQuery.some(term => 
          normalizedText(msg.content).includes(term) ||
          normalizedText(categoryLabels[msg.category] || '').includes(term) ||
          normalizedText(categories.find(c => c.key === msg.category)?.description || '').includes(term)
        )
      })
    : []

  const showSearchResults = searchQuery.trim().length > 0

  return (
    <>
      <header className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-2">
          Bibliotecă.
        </h2>
        <p className="text-stone-500 font-light">Cuvinte potrivite pentru orice moment.</p>
      </header>

      <div className="relative mb-8">
        <iconify-icon
          icon="solar:magnifer-linear"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          width="20"
        />
        <input
          type="text"
          placeholder="Caută o emoție sau situație..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/70 border border-white rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder:text-stone-400 shadow-sm transition-all"
        />
      </div>

      {showSearchResults ? (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <iconify-icon icon="solar:magnifer-linear" class="text-stone-400" width="18" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              Rezultate ({searchResults.length})
            </h3>
          </div>
          
          {loadingMessages ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 animate-pulse">
                  <div className="h-16 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {searchResults.map((message) => (
                  <SearchResultCard key={message.id} message={message} beneficiaryId={beneficiaryId} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <iconify-icon icon="solar:sad-square-linear" class="text-stone-400" width="32" />
              </div>
              <p className="text-stone-500 mb-2">Nu s-au găsit mesaje pentru "{searchQuery}"</p>
              <p className="text-xs text-stone-400">Încearcă alte cuvinte cheie</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <iconify-icon icon="solar:star-linear" class="text-amber-400" width="18" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Favorite</h3>
            </div>
            <FavoritesCarousel />
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Categorii</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.key} category={category} beneficiaryId={beneficiaryId} />
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCustomModalOpen(true)}
              className="glass-card p-5 rounded-2xl text-left group border-dashed border-stone-300 hover:border-stone-500 hover:bg-stone-50 transition-all col-span-1 md:col-span-2 flex items-center justify-center gap-3"
            >
              <iconify-icon icon="solar:pen-new-square-linear" class="text-stone-400" width="22" />
              <span className="font-medium text-stone-600">Compune un mesaj personalizat</span>
            </motion.button>
          </div>
        </>
      )}

      <CustomMessageModal isOpen={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} />
    </>
  )
}

function SearchResultCard({ message, beneficiaryId }: { message: Message; beneficiaryId?: string | null }) {
  const { toggleFavorite, isFavorite } = useFavorites()
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
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-300 flex flex-col"
    >
      <p className="text-sm text-stone-700 mb-3 line-clamp-4 flex-1">{message.content}</p>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-[10px] px-2 py-1 rounded-full border ${getTagColor(message.category).border} ${getTagColor(message.category).text} ${getTagColor(message.category).bg}`}>
          {categoryLabels[message.category] || message.category.replace(/_/g, ' ')}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/message/personalize/${message.id}${beneficiaryId ? `?beneficiaryId=${beneficiaryId}` : ''}`}
            className="text-stone-400 hover:text-stone-800 transition-colors"
          >
            <iconify-icon icon="solar:plain-linear" width="16" />
          </Link>
          <button
            onClick={() => toggleFavorite(message.id, message)}
            className={`transition-colors ${favorite ? 'text-amber-400' : 'text-stone-400 hover:text-amber-400'}`}
          >
            <Star className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function BibliotecaPageSkeleton() {
  return (
    <>
      <div className="h-8 w-32 bg-stone-200 rounded mb-2 animate-pulse" />
      <div className="h-6 w-48 bg-stone-200 rounded mb-8 animate-pulse" />
      <div className="h-12 bg-stone-200 rounded-xl mb-8 animate-pulse" />
      <div className="h-6 w-24 bg-stone-200 rounded mb-4 animate-pulse" />
      <div className="flex gap-4 pb-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[260px] h-32 bg-stone-200 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-6 w-24 bg-stone-200 rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-stone-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </>
  )
}

export default function BibliotecaPage() {
  return (
    <Suspense fallback={<BibliotecaPageSkeleton />}>
      <BibliotecaContent />
    </Suspense>
  )
}
