'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { X, Plus, Pencil, Trash2, Search, Users, MessageCircle, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import type { Message, MessageCategory } from '@/types'
import { cn } from '@/lib/utils'

const categories = [
  { key: 'school_harmony', title: 'Armonie la școală', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { key: 'exams_tests', title: 'Examene și teste', color: 'bg-violet-100 text-violet-600 border-violet-200' },
  { key: 'family_reconnection', title: 'Reconectare familială', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { key: 'overcoming_failure', title: 'Depășirea eșecului', color: 'bg-orange-100 text-orange-600 border-orange-200' },
]

type UserStats = {
  total_parents: number
  total_teachers: number
  total_admins: number
  total_users: number
  new_users_7_days: number
}

type MessageStats = {
  total_copies: number
  total_sends: number
  total_whatsapp: number
  total_actions: number
  whatsapp_percentage: number
  copy_percentage: number
}

type AgeStat = {
  beneficiary_age_range: string
  usage_count: number
  percentage: string
}

type TopMessage = {
  id: string
  content: string
  category: string
  usage_count: number
}

type AdminData = {
  user_stats: UserStats[]
  message_stats: MessageStats[]
  age_stats: AgeStat[]
  top_messages: TopMessage[]
}

type MessageFormData = {
  content: string
  category: MessageCategory
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'bg-white/60' 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: string
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
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-stone-800 mb-1">{value}</p>
      <p className="text-sm text-stone-500 font-medium">{title}</p>
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
  onConfirm 
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
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Ștergi Mesajul?</h3>
              <p className="text-stone-500 text-sm">
                Această acțiune nu poate fi inversată. Mesajul va fi dezactivat.
              </p>
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

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single()

      if (!profileData?.is_admin) {
        router.push('/')
        return
      }

      setLoading(false)
    }

    checkAdmin()
  }, [user, authLoading, router, supabase])

  useEffect(() => {
    if (!loading) {
      fetchAdminData()
      fetchMessages()
    }
  }, [loading])

  const fetchAdminData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_stats')
      if (error) throw error
      if (data) {
        setAdminData(data as AdminData)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
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
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMessage.id)

        if (error) throw error
        toast.success('Mesaj actualizat!')
      } else {
        const { error } = await supabase
          .from('messages')
          .insert({
            content: formData.content,
            category: formData.category,
            is_active: true
          })

        if (error) throw error
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

  const userStats = adminData?.user_stats?.[0]
  const messageStats = adminData?.message_stats?.[0]
  const topAgeCategory = adminData?.age_stats?.[0]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-stone-200 rounded mb-2" />
          <div className="h-6 w-48 bg-stone-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-stone-500">Panou de control și statistici</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Utilizatori"
          value={userStats?.total_users || 0}
          icon={Users}
          trend={`+${userStats?.new_users_7_days || 0} în 7 zile`}
        />
        <StatCard
          title="Acțiuni Totale"
          value={messageStats?.total_actions || 0}
          icon={MessageCircle}
        />
        <StatCard
          title="Categorii Populare"
          value={topAgeCategory?.beneficiary_age_range || 'N/A'}
          icon={Users}
          trend={`${topAgeCategory?.percentage || 0}%`}
        />
        <StatCard
          title="WhatsApp vs Copy"
          value={`${Math.round(messageStats?.whatsapp_percentage || 0)}% / ${Math.round(messageStats?.copy_percentage || 0)}%`}
          icon={Smartphone}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Distribuție Utilizatori</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Părinți</span>
              <span className="font-semibold text-stone-800">{userStats?.total_parents || 0}</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-400 rounded-full"
                style={{ width: `${userStats?.total_users ? (userStats!.total_parents / userStats!.total_users) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Profesori</span>
              <span className="font-semibold text-stone-800">{userStats?.total_teachers || 0}</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${userStats?.total_users ? (userStats!.total_teachers / userStats!.total_users) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Canal Preferat</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-stone-600 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> WhatsApp
              </span>
              <span className="font-semibold text-stone-800">{messageStats?.total_whatsapp || 0}</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${messageStats?.whatsapp_percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Copy
              </span>
              <span className="font-semibold text-stone-800">{messageStats?.total_copies || 0}</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${messageStats?.copy_percentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

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
                  <span className={cn(
                    'inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                    categories.find(c => c.key === message.category)?.color || 'bg-stone-100 text-stone-600'
                  )}>
                    {categoryLabels[message.category] || message.category}
                  </span>
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

const categoryLabels: Record<string, string> = {
  school_harmony: 'Armonie la școală',
  exams_tests: 'Examene și teste',
  family_reconnection: 'Reconectare familială',
  overcoming_failure: 'Depășirea eșecului',
  personalized: 'Personalizat',
}
