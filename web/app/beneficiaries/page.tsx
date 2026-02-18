'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useModal } from '@/contexts/ModalContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  User,
  Trash2,
  Edit2,
  Users,
  Baby,
  User as UserIcon,
  GraduationCap,
  Heart,
  Sparkles,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Beneficiary, BeneficiaryAgeRange } from '@/types'

const ageRangeIcons: Record<BeneficiaryAgeRange, React.ComponentType<{ className?: string }>> = {
  '8-10': Baby,
  '11-13': Heart,
  '14-16': UserIcon,
  '17-20': GraduationCap,
}

const ageRangeLabels: Record<BeneficiaryAgeRange, string> = {
  '8-10': '8-10 ani',
  '11-13': '11-13 ani',
  '14-16': '14-16 ani',
  '17-20': '17-20 ani',
}

const ageRangeColors: Record<BeneficiaryAgeRange, string> = {
  '8-10': 'from-pink-400 to-pink-600',
  '11-13': 'from-purple-400 to-purple-600',
  '14-16': 'from-blue-400 to-blue-600',
  '17-20': 'from-green-400 to-green-600',
}

export default function BeneficiariesPage() {
  const { user } = useAuth()
  const { openModal, closeModal } = useModal()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [beneficiariesCount, setBeneficiariesCount] = useState(0)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)
  const [formData, setFormData] = useState<{ first_name: string; age_range: BeneficiaryAgeRange }>({
    first_name: '',
    age_range: '8-10',
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching beneficiaries:', error)
        toast.error('Nu s-au putut încărca beneficiarii')
      } else if (data) {
        setBeneficiaries(data as Beneficiary[])
        setBeneficiariesCount(data.length)
      }

      setLoading(false)
    }

    fetchBeneficiaries()
  }, [user])

  const ensureProfileExists = async () => {
    if (!user) return false
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return true
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'parent',
        total_xp: 0,
        streak_count: 0,
        last_active_date: new Date().toISOString().split('T')[0],
      })

    if (error) {
      console.error('Failed to create profile:', error)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Trebuie să fii autentificat.')
      return
    }

    if (!formData.first_name.trim()) {
      toast.error('Te rog introdu un nume.')
      return
    }

    const profileOk = await ensureProfileExists()
    if (!profileOk) {
      toast.error('Nu s-a putut crea profilul.')
      return
    }

    if (editingBeneficiary) {
      const { error } = await supabase
        .from('beneficiaries')
        .update({
          first_name: formData.first_name,
          age_range: formData.age_range,
        })
        .eq('id', editingBeneficiary.id)

      if (error) {
        toast.error('Nu s-a putut actualiza.')
        return
      }

      setBeneficiaries(prev =>
        prev.map(b =>
          b.id === editingBeneficiary.id
            ? { ...b, ...formData, updated_at: new Date().toISOString() }
            : b
        )
      )
      toast.success('Beneficiar actualizat! ✏️')
    } else {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert({
          user_id: user.id,
          first_name: formData.first_name,
          age_range: formData.age_range,
        })
        .select()
        .single()

      if (error) {
        toast.error('Nu s-a putut adăuga.')
        return
      }

      if (data) {
        setBeneficiaries(prev => [data as Beneficiary, ...prev])
        setBeneficiariesCount(prev => prev + 1)
        toast.success('Beneficiar adăugat! 🎉')
      }
    }

    closeModal('beneficiary-form')
    setEditingBeneficiary(null)
    setFormData({ first_name: '', age_range: '8-10' })
  }

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary)
    setFormData({
      first_name: beneficiary.first_name,
      age_range: beneficiary.age_range,
    })
    openAddModal()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Nu s-a putut șterge.')
      return
    }

    setBeneficiaries(prev => prev.filter(b => b.id !== id))
    setBeneficiariesCount(prev => prev - 1)
    toast.success('Beneficiar șters.')
  }

  const openAddModal = () => {
    const modalContent = (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Prenume
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, first_name: e.target.value }))
            }
            className="w-full px-4 py-3 glass-input border border-white/40 rounded-xl focus:ring-2 focus:ring-primary-500/50 bg-white/40"
            placeholder="Ex: Maria"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Grupa de vârstă
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['8-10', '11-13', '14-16', '17-20'] as const).map((age) => {
              const Icon = ageRangeIcons[age]
              const gradientColor = ageRangeColors[age]
              const isSelected = formData.age_range === age
              
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, age_range: age }))
                  }
                  className={cn(
                    'relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300',
                    isSelected
                      ? 'border-primary-500 bg-white/60 shadow-lg shadow-primary-500/20'
                      : 'border-white/40 bg-white/40 hover:bg-white/60 hover:border-gray-200/50'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-xl',
                    `bg-gradient-to-br ${gradientColor}`
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{age} ani</span>
                  {isSelected && (
                    <Check className="absolute top-2 right-2 w-4 h-4 text-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeModal('beneficiary-form')}
            className="flex-1 glass border-white/40"
          >
            <X className="w-4 h-4 mr-2" />
            Anulează
          </Button>
          <Button type="submit" className="flex-1">
            {editingBeneficiary ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvează
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Adaugă
              </>
            )}
          </Button>
        </div>
      </form>
    )
    openModal('beneficiary-form', editingBeneficiary ? 'Editează beneficiar' : 'Adaugă beneficiar', modalContent, () => closeModal('beneficiary-form'))
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      <header className="p-3 pt-3 flex-shrink-0 glass border-b border-white/40 relative z-10">
        <div className="text-center">
          <h1 className="text-[15px] font-bold text-gray-900 mb-0.5">Beneficiari</h1>
          <p className="text-gray-500 text-[10px]">Copiii și elevii tăi</p>
        </div>

        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: 0.1
            }}
          >
            <motion.button
              onClick={openAddModal}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/30 text-green-600"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              {beneficiariesCount > 0 && (
                <span className="px-1.5 py-0.5 bg-green-200/80 backdrop-blur-sm rounded-full text-xs font-bold">
                  {beneficiariesCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </header>

      <div className="px-4 pt-4 pb-28 space-y-3 relative z-10">
        {beneficiaries.length === 0 ? (
          <Card className="text-center py-12 glass" padding="lg">
            <div className="w-16 h-16 bg-white/40 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-6">Nu aveți beneficiari adăugați încă.</p>
            <Button variant="secondary" onClick={openAddModal} className="glass border-white/40">
              <Sparkles className="w-4 h-4 mr-2" />
              Adaugă primul beneficiar
            </Button>
          </Card>
        ) : (
          beneficiaries.map((beneficiary) => {
            const AgeIcon = ageRangeIcons[beneficiary.age_range]
            const gradientColor = ageRangeColors[beneficiary.age_range]
            
            return (
              <Card 
                key={beneficiary.id} 
                className="glass relative overflow-hidden"
                padding="md"
              >
                <div className={cn(
                  'absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4 blur-xl',
                  `bg-gradient-to-br ${gradientColor}`
                )} />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                    `bg-gradient-to-br ${gradientColor}`
                  )}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {beneficiary.first_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <AgeIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{ageRangeLabels[beneficiary.age_range]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(beneficiary)}
                      className="p-2 rounded-lg hover:bg-white/40 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(beneficiary.id)}
                      className="p-2 rounded-lg hover:bg-red-50/60 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <div className="safe-area-inset-bottom" />
    </div>
  )
}
