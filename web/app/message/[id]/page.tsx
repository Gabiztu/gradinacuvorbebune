'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { MagicDust } from '@/components/ui/MagicDust'
import { ChevronLeft, User, Share2, Copy, Check, Sparkles, Heart, Star, Users } from 'lucide-react'
import { cn, KEYWORDS } from '@/lib/utils'
import { toast } from 'sonner'
import type { Beneficiary, Message } from '@/types'

export default function MessagePage() {
  const params = useParams()
  const router = useRouter()
  const messageId = params.id as string
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  const [message, setMessage] = useState<Message | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false)
  const [includeName, setIncludeName] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [copyTrigger, setCopyTrigger] = useState(false)
  const [copyPosition, setCopyPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (messageData) {
        setMessage(messageData as Message)
        setCustomMessage(messageData.content)
      }

      if (user) {
        const { data: benefData } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (benefData) {
          setBeneficiaries(benefData as Beneficiary[])
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [messageId, user])

  const logAnalytics = async () => {
    if (!user || !message) return

    await supabase.from('history').insert({
      user_id: user.id,
      message_id: message.id,
      beneficiary_name: selectedBeneficiary?.first_name || 'Nespecificat',
    })

    await supabase.from('analytics_logs').insert({
      message_id: message.id,
      sender_role: profile?.role || 'parent',
      beneficiary_age_range: selectedBeneficiary?.age_range || '8-10',
    })

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

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

    await supabase
      .from('profiles')
      .update({
        total_xp: (freshProfile?.total_xp || 0) + 10,
        streak_count: newStreak,
        last_active_date: today,
      })
      .eq('id', user.id)

    await refreshProfile()
  }

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator && navigator.share

  const handleShare = async () => {
    const text = includeName && selectedBeneficiary
      ? `${selectedBeneficiary.first_name}, ${customMessage}`
      : customMessage

    if (canShare) {
      try {
        await navigator.share({
          title: 'Cuvinte de Sus',
          text: text,
        })
        await logAnalytics()
        toast.success('Mesaj trimis cu succes! +10 XP')
        router.push('/')
        router.refresh()
        return
      } catch (err: any) {
        if (err.name !== 'AbortError') {
        } else {
          return
        }
      }
    }

    await handleCopy(text)
  }

  const handleCopy = async (text: string, e?: React.MouseEvent) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        
        if (e) {
          const rect = e.currentTarget.getBoundingClientRect()
          setCopyPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
          setCopyTrigger(true)
          setTimeout(() => setCopyTrigger(false), 500)
        }
        
        await logAnalytics()
        toast.success('Mesaj copiat și salvat! +10 XP 🌟')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1500)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          
          if (e) {
            const rect = e.currentTarget.getBoundingClientRect()
            setCopyPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
            setCopyTrigger(true)
            setTimeout(() => setCopyTrigger(false), 500)
          }
          
          await logAnalytics()
          toast.success('Mesaj copiat și salvat! +10 XP 🌟')
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 1500)
        } else {
          toast.error('Nu s-a putut copia.')
        }
      }
    } catch (err) {
      toast.error('Apasă lung pe text pentru a copia.')
    }
    
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleIncludeName = () => {
    if (includeName && selectedBeneficiary) {
      setCustomMessage(message?.content || '')
    } else if (!includeName && selectedBeneficiary) {
      setCustomMessage(`${selectedBeneficiary.first_name}, ${message?.content || ''}`)
    }
    setIncludeName(!includeName)
  }

  const insertKeyword = (keyword: string) => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end)
      textarea.value = before + keyword + after
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + keyword.length
      setCustomMessage(textarea.value)
    }
  }

  if (loading) {
    return null
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df] flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-sm" padding="lg">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Mesajul nu a fost găsit.</p>
          <Link href="/library" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Înapoi la bibliotecă
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df]">
      <header className="sticky top-0 z-10 glass border-b border-white/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/library" className="p-2 -ml-2 hover:bg-white/50 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Trimite mesajul</h1>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-28">
        <Card className="relative overflow-hidden" padding="lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-gray-800 text-lg leading-relaxed relative z-10">
            {includeName && selectedBeneficiary
              ? `${selectedBeneficiary.first_name}, ${customMessage}`
              : customMessage}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100/60 rounded-xl">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Include numele?
                </p>
                {selectedBeneficiary && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    {selectedBeneficiary.first_name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={toggleIncludeName}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors duration-300',
                includeName ? 'bg-primary-500' : 'bg-gray-300/60'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300',
                  includeName ? 'translate-x-7' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          {includeName && !selectedBeneficiary && (
            <Button
              variant="secondary"
              onClick={() => setIsBeneficiaryModalOpen(true)}
              className="w-full mt-4"
              size="sm"
            >
              <User className="w-4 h-4 mr-2" />
              Selectează beneficiar
            </Button>
          )}
        </Card>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Personalizează mesajul
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full h-40 px-4 py-4 glass-input border border-white/40 rounded-2xl focus:ring-2 focus:ring-primary-500/50 resize-none text-gray-800"
            placeholder="Scrie mesajul tău aici..."
          />
        </div>

        {message.category === 'personalized' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 ml-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Cuvinte cheie
            </p>
            <div className="flex flex-wrap gap-2">
              {KEYWORDS.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => insertKeyword(keyword)}
                  className="px-4 py-2 bg-primary-100/60 backdrop-blur-sm text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200/60 transition-colors border border-primary-200/50"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="fixed bottom-20 left-4 right-4 z-20">
          <Button onClick={handleShare} size="xl" className="w-full shadow-xl">
            <Share2 className="w-5 h-5 mr-2" />
            Trimite mesajul
          </Button>
        </div>

        <div className="pt-12">
          <button
            onClick={(e) => handleCopy(customMessage, e)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-4 glass rounded-2xl transition-all duration-300',
              copied ? 'bg-green-100/80 border-green-300/50' : 'hover:bg-white/60'
            )}
          >
            {copied ? (
              <span className="flex items-center gap-2 text-green-700 font-medium">
                <Check className="w-5 h-5 animate-success" />
                Copiat! +10 XP 🌟
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-600 font-medium">
                <Copy className="w-5 h-5" />
                Copiază în clipboard
              </span>
            )}
          </button>
        </div>
      </div>

      <MagicDust 
        trigger={copyTrigger} 
        x={copyPosition.x} 
        y={copyPosition.y} 
        color="#22c55e"
        particleCount={12}
      />

      <Modal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        title="Selectează beneficiarul"
      >
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {beneficiaries.length === 0 ? (
            <div className="text-center py-6">
              <div className="p-4 bg-gray-100/60 rounded-2xl inline-block mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Nu aveți beneficiari adăugați.
              </p>
              <Link 
                href="/beneficiaries" 
                className="text-primary-600 font-medium text-sm"
                onClick={() => setIsBeneficiaryModalOpen(false)}
              >
                + Adaugă unul
              </Link>
            </div>
          ) : (
            beneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                onClick={() => {
                  setSelectedBeneficiary(beneficiary)
                  setIsBeneficiaryModalOpen(false)
                  if (includeName) {
                    setCustomMessage(`${beneficiary.first_name}, ${message?.content || ''}`)
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left',
                  selectedBeneficiary?.id === beneficiary.id
                    ? 'border-primary-500 bg-primary-100/60 shadow-lg shadow-primary-500/20'
                    : 'border-white/40 bg-white/40 hover:bg-white/60 hover:border-gray-200/50'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl',
                  selectedBeneficiary?.id === beneficiary.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{beneficiary.first_name}</p>
                  <Badge variant="glass" className="text-xs mt-1">
                    {beneficiary.age_range} ani
                  </Badge>
                </div>
                {selectedBeneficiary?.id === beneficiary.id && (
                  <Check className="w-5 h-5 text-primary-500" />
                )}
              </button>
            ))
          )}
        </div>
      </Modal>

      <div className="safe-area-inset-bottom" />
    </div>
  )
}
