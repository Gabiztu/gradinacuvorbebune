'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Message } from '@/types'
import { BeneficiaryBadge } from '@/components/shared/BeneficiaryBadge'

export default function PersonalizePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const { beneficiaries, selectedBeneficiary, setSelectedBeneficiary } = useBeneficiary()
  const supabase = createClient()

  const messageId = resolvedParams.id
  const beneficiaryId = searchParams.get('beneficiaryId')

  const [message, setMessage] = useState<Message | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasAttemptedSelection, setHasAttemptedSelection] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true)
      setHasAttemptedSelection(false)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (data) {
        setMessage(data as Message)
        setEditedContent(data.content)
      }
      setLoading(false)
    }

    fetchMessage()
  }, [messageId, supabase])

  useEffect(() => {
    if (!message || hasAttemptedSelection) return
    
    const targetBeneficiaryId = beneficiaryId || localStorage.getItem('empatie_selected_beneficiary_id')
    if (!targetBeneficiaryId) {
      setHasAttemptedSelection(true)
      return
    }
    
    const beneficiary = beneficiaries.find(b => b.id === targetBeneficiaryId)
    if (beneficiary) {
      setSelectedBeneficiary(beneficiary)
      setEditedContent(`${beneficiary.first_name}, ${message.content}`)
    } else if (beneficiaries.length > 0) {
      setHasAttemptedSelection(true)
      return
    }
    
    setHasAttemptedSelection(true)
  }, [message, beneficiaries, beneficiaryId, hasAttemptedSelection, setSelectedBeneficiary])

  useEffect(() => {
    if (!message) return
    
    if (selectedBeneficiary) {
      setEditedContent(`${selectedBeneficiary.first_name}, ${message.content}`)
    } else {
      setEditedContent(message.content)
    }
  }, [selectedBeneficiary, message])

  const handleSend = async () => {
    if (!user || !message) return
    
    setSending(true)
    try {
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
      message_id: message.id,
      beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
      created_at: new Date().toISOString(),
    })

    await supabase.from('message_usage').insert({
      user_id: user.id,
      message_id: message.id,
      action_type: 'whatsapp',
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
          text: editedContent,
        })
      }

      router.push('/biblioteca')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('A apărut o eroare. Încearcă din nou.')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async () => {
    if (!user || !message) return
    
    await navigator.clipboard.writeText(editedContent)
    
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
      message_id: message.id,
      beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
      created_at: new Date().toISOString(),
    })

    await supabase.from('profiles').update({
      total_xp: (freshProfile?.total_xp || 0) + 10,
      streak_count: newStreak,
      last_active_date: today,
    }).eq('id', user.id)

    await supabase.from('message_usage').insert({
      user_id: user.id,
      message_id: message.id,
      action_type: 'copy',
      beneficiary_age_range: selectedBeneficiary?.age_range,
      user_role: profile?.role || 'parent',
    })

    toast.success('Copiat! +10 XP 🌟')
    router.push('/biblioteca')
  }

  const handleWhatsApp = async () => {
  if (!user || !message) return
  
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
    message_id: message.id,
    beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
    created_at: new Date().toISOString(),
  })
  await supabase.from('profiles').update({
    total_xp: (freshProfile?.total_xp || 0) + 10,
    streak_count: newStreak,
    last_active_date: today,
  }).eq('id', user.id)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(editedContent)}`
  
  // iOS-compatible: Use location.href and remove immediate navigation
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // iOS: Direct navigation works better
    window.location.href = whatsappUrl
  } else {
    // Desktop/Android: Use window.open
    window.open(whatsappUrl, '_blank')
  }
  
  toast.success('Trimis pe WhatsApp! +10 XP 🌟')
  
  // Remove immediate router.push - let user decide when to leave
  // Or use a small delay only on non-iOS:
  // setTimeout(() => router.push('/biblioteca'), 500)
}

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-stone-200 rounded mb-2" />
        <div className="h-6 w-48 bg-stone-200 rounded mb-8" />
        <div className="h-40 bg-stone-200 rounded-3xl" />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Mesajul nu a fost găsit.</p>
      </div>
    )
  }

  return (
    <div key={messageId}>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/biblioteca"
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-600 hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-800">
            Personalizează.
          </h2>
          <p className="text-stone-500 font-light">Adaptează mesajul pentru copilul tău</p>
        </div>
      </div>

      {beneficiaries.length > 0 && (
        <div className="mb-6">
          <BeneficiaryBadge />
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Mesajul tău
        </label>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full h-40 p-4 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-200 focus:outline-none resize-none text-stone-800 placeholder:text-stone-400 mb-4"
          placeholder="Începe să scrii aici..."
        />

        <div className="flex justify-end">
            <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="w-10 h-10 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-800 hover:bg-stone-50 flex items-center justify-center transition-all"
              title="Copiază textul"
            >
              <iconify-icon
                icon="solar:copy-linear"
                width="20"
              ></iconify-icon>
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-10 h-10 rounded-xl border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-all"
              title="Trimite pe WhatsApp"
            >
              <iconify-icon
                icon="solar:chat-square-call-linear"
                width="20"
              ></iconify-icon>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !message}
        className="w-full py-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-base shadow-lg shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Se trimite...
          </>
        ) : (
          <>
            Trimite
            <iconify-icon icon="solar:plain-bold" width="18"></iconify-icon>
          </>
        )}
      </button>
    </div>
  )
}