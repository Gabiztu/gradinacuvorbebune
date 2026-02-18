'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { X, Plus, Pencil, Trash2, Search, Users, MessageCircle, Copy, Smartphone, Heart } from 'lucide-react'
import { toast } from 'sonner'
import type { Message, MessageCategory, ProposedMessage } from '@/types'
import { cn } from '@/lib/utils'

const categories = [
  { key: 'school_harmony', title: 'Armonie la școală', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { key: 'exams_tests', title: 'Examene și teste', color: 'bg-violet-100 text-violet-600 border-violet-200' },
  { key: 'family_reconnection', title: 'Reconectare familială', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { key: 'overcoming_failure', title: 'Depășirea eșecului', color: 'bg-orange-100 text-orange-600 border-orange-200' },
]

type UserStats = {
  total_users: number
  total_parents: number
  total_teachers: number
}

type MessageStats = {
  total_sent_from_history: number
  total_actions_logs: number
  whatsapp_percent: number
  copy_percent: number
  send_percent: number
}

type TopAgeCategory = {
  range: string
  count: number
}

type AdminStats = {
  user_stats: UserStats
  message_stats: MessageStats
  top_age_category: TopAgeCategory
}

type MessageFormData = {
  content: string
  category: MessageCategory
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 rounded-3xl border border-white/40 bg-white/60">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-stone-200 animate-pulse" />
      </div>
      <div className="h-9 w-16 bg-stone-200 rounded animate-pulse mb-3" />
      <div className="h-4 w-28 bg-stone-200 rounded animate-pulse mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-stone-300 rounded-full" style={{ width: '60%' }} />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-stone-300 rounded-full" style={{ width: '30%' }} />
        </div>
      </div>
    </div>
  )
}

function AdminSkeleton() {
  return (
    <div className="pb-8">
      <header className="mb-8">
        <div className="h-9 w-48 bg-stone-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-40 bg-stone-200 rounded animate-pulse" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-48 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-10 w-36 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-stone-200 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40">
              <div className="flex-1 min-w-0 mr-4">
                <div className="h-4 w-full bg-stone-200 rounded animate-pulse mb-2" />
                <div className="h-5 w-20 bg-stone-200 rounded-full animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-stone-200 rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-stone-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UserStatsCard({ 
  stats: userStats 
}: { 
  stats: UserStats | null | undefined 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl border border-white/40 bg-white/60"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50">
          <Users className="w-6 h-6 text-stone-700" />
        </div>
      </div>
      <p className="text-3xl font-bold text-stone-800 mb-3">
        {userStats?.total_users || 0}
      </p>
      <p className="text-sm text-stone-500 font-medium mb-4">Total Utilizatori</p>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-stone-600 text-sm">Părinți</span>
          <span className="font-semibold text-stone-800">{userStats?.total_parents || 0}</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-rose-400 rounded-full"
            style={{ width: `${userStats?.total_users ? ((userStats!.total_parents || 0) / userStats!.total_users * 100) : 0}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-stone-600 text-sm">Profesori</span>
          <span className="font-semibold text-stone-800">{userStats?.total_teachers || 0}</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400 rounded-full"
            style={{ width: `${userStats?.total_users ? ((userStats!.total_teachers || 0) / userStats!.total_users * 100) : 0}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function MessageStatsCard({ 
  title,
  value,
  icon: Icon,
  color = 'bg-white/60'
}: { 
  title: string
  value: string | number
  icon: any
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card p-6 rounded-3xl border border-white/40', color)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color.replace('bg-', 'bg-').replace('60', '50'))}>
          <Icon className="w-6 h-6 text-stone-700" />
        </div>
      </div>
      <p className="text-3xl font-bold text-stone-800 mb-1">{value}</p>
      <p className="text-sm text-stone-500 font-medium">{title}</p>
    </motion.div>
  )
}

function ActionDistributionCard({ 
  stats: messageStats 
}: { 
  stats: MessageStats | null | undefined 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl border border-white/40 bg-white/60"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50">
          <MessageCircle className="w-6 h-6 text-stone-700" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-stone-600 text-sm">
            <Smartphone className="w-4 h-4" /> WhatsApp
          </span>
          <span className="font-semibold text-stone-800">{messageStats?.whatsapp_percent || 0}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-stone-600 text-sm">
            <Copy className="w-4 h-4" /> Copy
          </span>
          <span className="font-semibold text-stone-800">{messageStats?.copy_percent || 0}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-stone-600 text-sm">
            <MessageCircle className="w-4 h-4" /> Send
          </span>
          <span className="font-semibold text-stone-800">{messageStats?.send_percent || 0}%</span>
        </div>
      </div>
    </motion.div>
  )
}

function TopAgeCategoryCard({ 
  topCategory 
}: { 
  topCategory: TopAgeCategory | null | undefined 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl border border-white/40 bg-white/60"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50">
          <Heart className="w-6 h-6 text-stone-700" />
        </div>
      </div>
      <p className="text-3xl font-bold text-stone-800 mb-1">
        {topCategory?.range || 'N/A'}
      </p>
      <p className="text-sm text-stone-500 font-medium mb-1">Top Beneficiari</p>
      <p className="text-xs text-stone-400">
        {topCategory?.count || 0} mesaje trimise
      </p>
    </motion.div>
  )
}

function MessageModal({ 
  isOpen, 
  onClose, 
  message,
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  message?: Message | null
  onSave: (data: MessageFormData) => Promise<void>
}) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<MessageCategory>('school_harmony')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setContent(message?.content || '')
      setCategory(message?.category || 'school_harmony')
    }
  }, [isOpen, message])

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Mesajul nu poate fi gol')
      return
    }
    setSaving(true)
    await onSave({ content: content.trim(), category })
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg w-full bg-[#FAFAF9] rounded-t-3xl md:rounded-3xl p-6 shadow-xl pb-24 md:pb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-stone-800">
                {message ? 'Editează Mesajul' : 'Mesaj Nou'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Categorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MessageCategory)}
                  className="w-full px-4 py-3 bg-white/60 border border-white rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Scrie mesajul tău aici..."
                  className="w-full h-40 p-4 bg-white/60 border border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none text-stone-700"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-300 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-50 font-medium text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  message?: Message | null
}) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm w-full bg-[#FAFAF9] rounded-t-3xl md:rounded-3xl p-6 shadow-xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Șterge mesajul?</h3>
              <p className="text-stone-500 text-sm">Această acțiune nu poate fi anulată.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-300 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirm}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ProposalCard({
  proposal,
  onApprove,
  onReject,
  onEdit,
}: {
  proposal: ProposedMessage
  onApprove: (proposal: ProposedMessage, category: string) => void
  onReject: (proposal: ProposedMessage) => void
  onEdit: (proposal: ProposedMessage, newContent: string) => void
}) {
  const [category, setCategory] = useState('school_harmony')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(proposal.content || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEditing) {
      setEditContent(proposal.content || '')
    }
  }, [proposal.content, isEditing])

  const handleSaveEdit = async () => {
    setSaving(true)
    await onEdit(proposal, editContent)
    setSaving(false)
    setIsEditing(false)
  }

  const getSenderInitials = () => {
    const name = proposal.profiles?.first_name || proposal.profiles?.email || 'U'
    return name.charAt(0).toUpperCase()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}z`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-6 rounded-[32px] bg-white/45 backdrop-blur-xl border border-white/40"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-rose-300 flex items-center justify-center text-white text-xs font-medium">
            {getSenderInitials()}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">
              {proposal.profiles?.first_name || proposal.profiles?.email?.split('@')[0] || 'Utilizator'}
            </p>
            <p className="text-xs text-stone-400">{timeAgo(proposal.created_at)}</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-24 p-3 rounded-xl bg-white/60 border border-stone-200 text-stone-700 text-sm mb-4"
        />
      ) : (
        <p className="text-stone-700 mb-4 whitespace-normal break-words">{proposal.content}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-white/60 border border-white rounded-xl text-sm"
        >
          <option value="school_harmony">Armonie la școală</option>
          <option value="exams_tests">Examene și teste</option>
          <option value="family_reconnection">Reconectare familială</option>
          <option value="overcoming_failure">Depășirea eșecului</option>
        </select>

        {isEditing ? (
          <>
            <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Se salvează...' : 'Salvează'}
            </button>
            <button onClick={() => { setIsEditing(false); setEditContent(proposal.content || ''); }} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm hover:bg-stone-200">
              Anulează
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm hover:bg-stone-200">
            Editează
          </button>
        )}

        {!isEditing && (
          <>
            <button
              onClick={() => onApprove(proposal, category)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700"
            >
              Aprobă (+50 XP)
            </button>

            <button
              onClick={() => onReject(proposal)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm hover:bg-red-100"
            >
              Respinge
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

const categoryLabels: Record<string, string> = {
  school_harmony: 'Armonie la școală',
  exams_tests: 'Examene și teste',
  family_reconnection: 'Reconectare familială',
  overcoming_failure: 'Depășirea eșecului',
}

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [activeTab, setActiveTab] = useState<'messages' | 'proposals'>('messages')
  const [proposedMessages, setProposedMessages] = useState<ProposedMessage[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null)

  const MAX_RETRIES = 3

  const fetchAdminData = useCallback(async (attempt = 0) => {
    try {
      setError(null)
      
      const { data, rpcError } = await supabase.rpc('get_admin_stats')
      
      if (rpcError) {
        throw rpcError
      }
      
      if (data) {
        setStats(data as AdminStats)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying admin stats (${attempt + 1}/${MAX_RETRIES})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        return fetchAdminData(attempt + 1)
      }
      
      setError('Nu am putut încărca datele. Încearcă din nou.')
      console.error('Admin stats error after retries:', err)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      window.location.replace('/login')
      return
    }

    const checkAdmin = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single()

      if (!profileData?.is_admin) {
        router.push('/')
        return
      }

      setIsAdmin(true)
    }

    checkAdmin()
  }, [user, authLoading, router, supabase])

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData()
      fetchMessages()
      fetchProposedMessages()
      
      // Polling for new proposals (more reliable than realtime INSERT)
      const pollInterval = setInterval(fetchProposedMessages, 10000)
      
      const channel = supabase
        .channel('proposals')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'proposed_messages' },
          (payload: any) => {
            // If status changed to anything other than 'pending', remove from list
            if (payload.new.status !== 'pending') {
              setProposedMessages(prev => prev.filter(p => p.id !== payload.new.id))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'proposed_messages' },
          (payload: any) => {
            setProposedMessages(prev => prev.filter(p => p.id !== payload.old.id))
          }
        )
        .subscribe()

      return () => {
        clearInterval(pollInterval)
        supabase.removeChannel(channel)
      }
    }
  }, [isAdmin, supabase, fetchAdminData])

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data) {
        setMessages(data as Message[])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSaveMessage = async (formData: MessageFormData) => {
    try {
      if (editingMessage) {
        const { error } = await supabase
          .from('messages')
          .update({
            content: formData.content,
            category: formData.category,
            age_range: ['8-10', '11-13', '14-16', '17-20'],
            role_target: ['parent', 'teacher'],
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMessage.id)

        if (error) {
          console.error('Supabase error:', error.message, error.details)
          throw new Error(error.message)
        }
        toast.success('Mesaj actualizat!')
      } else {
        const { error } = await supabase
          .from('messages')
          .insert({
            content: formData.content,
            category: formData.category,
            age_range: ['8-10', '11-13', '14-16', '17-20'],
            role_target: ['parent', 'teacher'],
            is_active: true
          })

        if (error) {
          console.error('Supabase error:', error.message, error.details)
          throw new Error(error.message)
        }
        toast.success('Mesaj creat!')
      }

      setIsMessageModalOpen(false)
      setEditingMessage(null)
      fetchMessages()
      fetchAdminData()
    } catch (error) {
      console.error('Error saving message:', error)
      toast.error('A apărut o eroare')
    }
  }

  const handleDeleteMessage = async () => {
    if (!deletingMessage) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', deletingMessage.id)

      if (error) throw error
      toast.success('Mesaj șters!')

      setIsDeleteModalOpen(false)
      setDeletingMessage(null)
      fetchMessages()
      fetchAdminData()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('A apărut o eroare')
    }
  }

  const fetchProposedMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('proposed_messages')
        .select('*, profiles(first_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      // Ensure we only set proposals that are actually pending
      const pendingProposals = (data || []).filter((p: any) => p.status === 'pending')
      setProposedMessages(pendingProposals)
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setProposalsLoading(false)
    }
  }

  const handleApproveProposal = async (proposal: ProposedMessage, category: string) => {
    // Store for potential revert
    const proposalToRevert = proposal
    
    // Optimistic UI: remove immediately from proposals
    setProposedMessages(prev => prev.filter(p => p.id !== proposal.id))
    
    try {
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          content: proposal.content,
          category: category,
          age_range: ['8-10', '11-13', '14-16', '17-20'],
          role_target: ['parent', 'teacher'],
          is_active: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      // Add to active messages immediately (Optimistic UI for Mesaje tab)
      if (insertedMessage) {
        setMessages(prev => [{ ...insertedMessage }, ...prev])
      }

      const { error: updateError } = await supabase
        .from('proposed_messages')
        .update({ status: 'approved' })
        .eq('id', proposal.id)

      if (updateError) {
        console.error('Update error:', updateError)
        // Revert: put proposal back
        setProposedMessages(prev => [proposalToRevert, ...prev])
        // Remove the added message
        if (insertedMessage) {
          setMessages(prev => prev.filter(m => m.id !== insertedMessage.id))
        }
        throw updateError
      }

      await supabase.rpc('increment_xp', { 
        user_id: proposal.user_id, 
        amount: 50 
      })

      toast.success('Mesaj aprobat! +50 XP acordat autorului.')
      fetchAdminData()
    } catch (err) {
      console.error('Error approving proposal:', err)
      toast.error('A apărut o eroare. Vă rugăm încercați din nou.')
    }
  }

  const handleRejectProposal = async (proposal: ProposedMessage) => {
    // Optimistic UI: remove immediately
    setProposedMessages(prev => prev.filter(p => p.id !== proposal.id))
    
    try {
      const { error } = await supabase
        .from('proposed_messages')
        .delete()
        .eq('id', proposal.id)

      if (error) throw error
      toast.success('Propunere respinsă.')
    } catch (err) {
      console.error('Error rejecting proposal:', err)
      toast.error('A apărut o eroare.')
    }
  }

  const handleEditProposal = async (proposal: ProposedMessage, newContent: string) => {
    try {
      const { error } = await supabase
        .from('proposed_messages')
        .update({ content: newContent })
        .eq('id', proposal.id)

      if (error) {
        console.error('Error editing proposal:', error)
        throw error
      }
      
      // Optimistic update: update local state immediately
      setProposedMessages(prev => prev.map(p => 
        p.id === proposal.id ? { ...p, content: newContent } : p
      ))
      
      toast.success('Mesaj actualizat!')
    } catch (err) {
      console.error('Error editing proposal:', err)
      toast.error('A apărut o eroare.')
    }
  }

  const openEditModal = (message: Message) => {
    setEditingMessage(message)
    setIsMessageModalOpen(true)
  }

  const openAddModal = () => {
    setEditingMessage(null)
    setIsMessageModalOpen(true)
  }

  const openDeleteModal = (message: Message) => {
    setDeletingMessage(message)
    setIsDeleteModalOpen(true)
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryLabels[msg.category]?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || msg.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (authLoading || isAdmin === null) {
    return <AdminSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-stone-600 font-medium mb-4">{error}</p>
          <button 
            onClick={() => fetchAdminData()}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-stone-500">Panou de control și statistici</p>
      </header>

      <AnimatePresence mode="wait">
        {stats ? (
          <motion.div
            key="stats-loaded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <UserStatsCard stats={stats?.user_stats} />
              <MessageStatsCard
                title="Mesaje Trimise"
                value={stats?.message_stats?.total_sent_from_history || 0}
                icon={MessageCircle}
                color="bg-white/60"
              />
              <ActionDistributionCard stats={stats?.message_stats} />
              <TopAgeCategoryCard topCategory={stats?.top_age_category} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'messages'
              ? 'bg-stone-800 text-white'
              : 'bg-white/60 text-stone-600 hover:bg-white/80'
          }`}
        >
          Mesaje
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'proposals'
              ? 'bg-stone-800 text-white'
              : 'bg-white/60 text-stone-600 hover:bg-white/80'
          }`}
        >
          Cereri Noi
          {proposedMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
              {proposedMessages.length}
            </span>
          )}
        </button>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'messages' && (
        <div className="glass-card p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Mesaje</h3>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Caută mesaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/60 border border-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 w-full md:w-64"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white/60 border border-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
            >
              <option value="all">Toate categoriile</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>{cat.title}</option>
              ))}
            </select>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adaugă
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-stone-700 line-clamp-2">{message.content}</p>
                  {message.category !== 'personalized' && (
                    <span className={cn(
                      'inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                      categories.find(c => c.key === message.category)?.color || 'bg-stone-100 text-stone-600'
                    )}>
                      {categoryLabels[message.category] || message.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(message)}
                    className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(message)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              <p>Nu s-au găsit mesaje</p>
            </div>
          )}
        </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {proposalsLoading ? (
            <div className="text-center py-8 text-stone-500">Se încarcă...</div>
          ) : proposedMessages.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl text-center">
              <p className="text-stone-500">Nu există propuneri în așteptare.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {proposedMessages.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onApprove={handleApproveProposal}
                  onReject={handleRejectProposal}
                  onEdit={handleEditProposal}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={editingMessage}
        onSave={handleSaveMessage}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMessage}
        message={deletingMessage}
      />
    </div>
  )
}
