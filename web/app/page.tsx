'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { BeneficiaryBadge } from '@/components/shared/BeneficiaryBadge'
import { RecentHistory } from '@/components/shared/RecentHistory'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { selectedBeneficiary } = useBeneficiary()
  const { favoritesMessages } = useFavorites()
  const router = useRouter()
  const [dailyMessage, setDailyMessage] = useState<Message | null>(null)
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const xp = profile?.total_xp || 0
  const streak = profile?.streak_count || 12

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      const fetchMessages = async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('is_active', true)
        
        if (data && data.length > 0) {
          const messages = data as Message[]
          setAllMessages(messages)
          const randomIndex = Math.floor(Math.random() * messages.length)
          setDailyMessage(messages[randomIndex])
        }
      }
      
      fetchMessages()
    }
  }, [mounted, user])

  if (!mounted || authLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-64 bg-stone-200 rounded mb-2" />
        <div className="h-6 w-48 bg-stone-200 rounded mb-8" />
        <div className="h-40 bg-stone-200 rounded-3xl mb-6" />
        <div className="h-48 bg-stone-200 rounded-3xl" />
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 11) return 'Bună dimineața!'
    if (hour >= 11 && hour < 18) return 'Bună ziua!'
    return 'Bună seara!'
  }

  const handleRefresh = async () => {
    if (allMessages.length === 0 || isRefreshing) return
    
    setIsRefreshing(true)
    
    let newIndex: number
    do {
      newIndex = Math.floor(Math.random() * allMessages.length)
    } while (allMessages.length > 1 && allMessages[newIndex].id === dailyMessage?.id)
    
    setDailyMessage(allMessages[newIndex])
    
    await new Promise(resolve => setTimeout(resolve, 300))
    setIsRefreshing(false)
  }

  const handleWhatsApp = async () => {
    if (!user || !dailyMessage) return

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: freshProfile } = await supabase
      .from('profiles')
      .select('total_xp, streak_count, last_active_date')
      .eq('id', user.id)
      .single()

    let newStreak = 1
    if (freshProfile) {
      if (freshProfile.last_active_date === today) {
        newStreak = freshProfile.streak_count
      } else if (freshProfile.last_active_date === yesterday) {
        newStreak = freshProfile.streak_count + 1
      }
    }

    await supabase.from('history').insert({
      user_id: user.id,
      message_id: dailyMessage.id,
      beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
      created_at: new Date().toISOString(),
    })

    await supabase.from('message_usage').insert({
      user_id: user.id,
      message_id: dailyMessage.id,
      action_type: 'share',
      beneficiary_age_range: selectedBeneficiary?.age_range,
      user_role: profile?.role || 'parent',
    })

    await supabase.from('profiles').update({
      total_xp: (freshProfile?.total_xp || 0) + 10,
      streak_count: newStreak,
      last_active_date: today,
    }).eq('id', user.id)

    toast.success('Mesaj trimis! +10 XP 🌟')

    if (navigator.share) {
      await navigator.share({
        text: dailyMessage.content,
      })
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-stone-800 mb-2">
            {getGreeting()}
          </h2>
          <p className="text-stone-500 font-light text-lg">
            Cuvintele de azi cresc grădina de mâine.
          </p>
        </div>
        
        <BeneficiaryBadge />
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Hero Widget */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => window.location.href = selectedBeneficiary ? `/biblioteca?beneficiaryId=${selectedBeneficiary.id}` : '/biblioteca'}
          className="glass-panel rounded-3xl p-6 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/50 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-medium mb-3">
                <iconify-icon icon="solar:fire-bold" width="12" />
                Serie: {streak} Zile
              </span>
              <h3 className="text-xl font-medium text-stone-800 tracking-tight">
                Grădina {selectedBeneficiary ? `lui ${selectedBeneficiary.first_name}` : ''}
              </h3>
              <p className="text-sm text-stone-500 mt-1 font-light max-w-sm">
                Ai trimis mesaje în această săptămână. Planta ta continuă să crească.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-stone-400">
              <iconify-icon icon="solar:arrow-right-up-linear" width="24" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/30">
              <div 
                className="h-full bg-gradient-to-r from-green-300 to-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                style={{ width: `${Math.min((xp % 200) / 2, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Suggestion */}
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-stone-800 tracking-tight">Sugestia Zilei</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || allMessages.length === 0}
              className="text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
            >
              <iconify-icon
                icon="solar:refresh-linear"
                width="20"
                class={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
          
          {dailyMessage ? (
            <>
              <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100/50 mb-6 relative">
                <iconify-icon icon="solar:quote-up-square-linear" class="absolute top-4 left-4 text-orange-200" width="24" />
                <p className="text-base text-stone-700 italic font-light leading-relaxed pl-8">
                  {dailyMessage.content}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!user || !dailyMessage) return

                    const { createClient } = await import('@/lib/supabase/client')
                    const supabase = createClient()

                    const today = new Date().toISOString().split('T')[0]
                    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                    const { data: freshProfile } = await supabase
                      .from('profiles')
                      .select('total_xp, streak_count, last_active_date')
                      .eq('id', user.id)
                      .single()

                    let newStreak = 1
                    if (freshProfile) {
                      if (freshProfile.last_active_date === today) {
                        newStreak = freshProfile.streak_count
                      } else if (freshProfile.last_active_date === yesterday) {
                        newStreak = freshProfile.streak_count + 1
                      }
                    }

                    await supabase.from('history').insert({
                      user_id: user.id,
                      message_id: dailyMessage.id,
                      beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
                      created_at: new Date().toISOString(),
                    })

                    await supabase.from('message_usage').insert({
                      user_id: user.id,
                      message_id: dailyMessage.id,
                      action_type: 'share',
                      beneficiary_age_range: selectedBeneficiary?.age_range,
                      user_role: profile?.role || 'parent',
                    })

                    await supabase.from('profiles').update({
                      total_xp: (freshProfile?.total_xp || 0) + 10,
                      streak_count: newStreak,
                      last_active_date: today,
                    }).eq('id', user.id)

                    toast.success('Mesaj trimis! +10 XP 🌟')

                    if (navigator.share) {
                      await navigator.share({
                        text: dailyMessage.content,
                      })
                    }
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-50 font-medium text-sm transition-all shadow-lg shadow-stone-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Trimite
                  <iconify-icon icon="solar:plain-bold" width="16" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <iconify-icon icon="solar:loading-linear" class="animate-spin mb-2" width="32" />
              <p>Se încarcă sugestia...</p>
            </div>
          )}
        </div>

        <RecentHistory />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
              <iconify-icon icon="solar:star-linear" width="22" />
            </div>
            <p className="text-2xl font-semibold text-stone-800">{favoritesMessages.length}</p>
            <p className="text-xs text-stone-500">Mesaje Favorite</p>
          </div>
          
          <div className="glass-card p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center mb-3">
              <iconify-icon icon="solar:fire-bold" width="22" />
            </div>
            <p className="text-2xl font-semibold text-stone-800">{xp}</p>
            <p className="text-xs text-stone-500">XP Total</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Acces Rapid</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/biblioteca"
              className="flex items-center gap-3 p-4 rounded-xl bg-white/50 hover:bg-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <iconify-icon icon="solar:book-bookmark-linear" width="22" />
              </div>
              <span className="text-sm font-medium text-stone-700">Biblioteca</span>
            </Link>
            
            <Link
              href="/beneficiari"
              className="flex items-center gap-3 p-4 rounded-xl bg-white/50 hover:bg-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <iconify-icon icon="solar:users-group-rounded-linear" width="22" />
              </div>
              <span className="text-sm font-medium text-stone-700">Beneficiari</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}