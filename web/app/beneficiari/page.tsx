'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { cn } from '@/lib/utils'
import type { Beneficiary, BeneficiaryAgeRange } from '@/types'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'

const ageRanges: BeneficiaryAgeRange[] = ['8-10', '11-13', '14-16', '17-20']
const relations = ['Elev/Elevă', 'Nepot/Nepoată', 'Fiu/Fiică', 'Frate/Soră', 'Altul']

function AddBeneficiaryModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Beneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [ageRange, setAgeRange] = useState<BeneficiaryAgeRange>('8-10')
  const [relation, setRelation] = useState('Fiu')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.overscrollBehavior = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.overscrollBehavior = ''
      setFirstName('')
      setAgeRange('8-10')
      setRelation('Fiu')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.overscrollBehavior = ''
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return

    onSubmit({
      first_name: firstName.trim(),
      age_range: ageRange,
      relation: relation,
    })

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
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto md:max-h-[58vh] md:inset-0 md:m-auto md:max-w-md md:w-auto w-full bg-[#FAFAF9] rounded-t-3xl md:rounded-3xl p-6 shadow-xl pb-8 md:pb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-stone-800">Adaugă Beneficiar</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => window.scrollTo(0, 0)}
                  placeholder="Ex: Matei"
                  className="glass-input w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Vârstă
                </label>
                <div className="flex gap-2">
                  {ageRanges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setAgeRange(range)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        ageRange === range
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/60 text-stone-600 hover:bg-white'
                      )}
                    >
                      {range} ani
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Relație
                </label>
                <div className="flex flex-wrap gap-2">
                  {relations.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelation(rel)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        relation === rel
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/60 text-stone-600 hover:bg-white'
                      )}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!firstName.trim()}
                className="w-full py-3.5 rounded-xl bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adaugă
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function EditBeneficiaryModal({
  isOpen,
  onClose,
  onSubmit,
  beneficiary,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Beneficiary>) => void
  beneficiary: Beneficiary | null
}) {
  const [firstName, setFirstName] = useState(beneficiary?.first_name || '')
  const [ageRange, setAgeRange] = useState<BeneficiaryAgeRange>(beneficiary?.age_range || '8-10')
  const [relation, setRelation] = useState(beneficiary?.relation || 'Fiu')

  useEffect(() => {
    if (isOpen && beneficiary) {
      setFirstName(beneficiary.first_name)
      setAgeRange(beneficiary.age_range)
      setRelation(beneficiary.relation)
      document.body.style.overflow = 'hidden'
      document.body.style.overscrollBehavior = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.overscrollBehavior = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.overscrollBehavior = ''
    }
  }, [isOpen, beneficiary])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return

    onSubmit({
      first_name: firstName.trim(),
      age_range: ageRange,
      relation: relation,
    })

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
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto md:max-h-[58vh] md:inset-0 md:m-auto md:max-w-md md:w-auto w-full bg-[#FAFAF9] rounded-t-3xl md:rounded-3xl p-6 shadow-xl pb-8 md:pb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-stone-800">Editează Beneficiar</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => window.scrollTo(0, 0)}
                  placeholder="Ex: Matei"
                  className="glass-input w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Vârstă
                </label>
                <div className="flex gap-2">
                  {ageRanges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setAgeRange(range)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        ageRange === range
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/60 text-stone-600 hover:bg-white'
                      )}
                    >
                      {range} ani
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">
                  Relație
                </label>
                <div className="flex flex-wrap gap-2">
                  {relations.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelation(rel)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        relation === rel
                          ? 'bg-stone-800 text-white'
                          : 'bg-white/60 text-stone-600 hover:bg-white'
                      )}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!firstName.trim()}
                className="w-full py-3.5 rounded-xl bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvează
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function BeneficiaryCard({
  beneficiary,
  onEdit,
  onDelete,
}: {
  beneficiary: Beneficiary
  onEdit: () => void
  onDelete: () => void
}) {
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (ageRange: string) => {
    const colors: Record<string, { bg: string; border: string }> = {
      '8-10': { bg: 'bg-blue-100 text-blue-600', border: 'border-blue-300' },
      '11-13': { bg: 'bg-green-100 text-green-600', border: 'border-green-300' },
      '14-16': { bg: 'bg-amber-100 text-amber-600', border: 'border-amber-300' },
      '17-20': { bg: 'bg-rose-100 text-rose-600', border: 'border-rose-300' },
    }
    return colors[ageRange] || { bg: 'bg-stone-100 text-stone-600', border: 'border-stone-300' }
  }

  const color = getAvatarColor(beneficiary.age_range)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel p-4 rounded-2xl flex items-center gap-4 border-l-4",
        color.border
      )}
    >
      <div className={cn(
        'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm',
        color.bg
      )}>
        {getInitials(beneficiary.first_name)}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-medium text-stone-800">{beneficiary.first_name}</h3>
        <p className="text-xs text-stone-500">
          {beneficiary.relation} • {beneficiary.age_range} ani
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="w-9 h-9 rounded-xl hover:bg-white text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function BeneficiariPage() {
  const { beneficiaries, loading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiary()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = async (data: Omit<Beneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addBeneficiary(data)
  }

  const handleEdit = async (data: Partial<Beneficiary>) => {
    if (!editingBeneficiary) return
    try {
      await updateBeneficiary(editingBeneficiary.id, data)
      setEditingBeneficiary(null)
    } catch (error) {
      console.error('Error updating beneficiary:', error)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteBeneficiary(id)
    setDeletingId(null)
  }

  const openEditModal = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary)
    setIsEditModalOpen(true)
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-1">
            Beneficiari:
          </h2>
          <p className="text-stone-500 font-light">Cui trimitem gânduri bune?</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-rose-300 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-stone-200" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-stone-200 rounded mb-2" />
                  <div className="h-3 w-16 bg-stone-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <iconify-icon icon="solar:users-plus-linear" class="text-stone-400" width="32" />
          </div>
          <p className="text-stone-500 mb-4">Nu ai niciun beneficiar adăugat.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium"
          >
            Adaugă primul beneficiar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {beneficiaries.map((beneficiary) => (
            <BeneficiaryCard
              key={beneficiary.id}
              beneficiary={beneficiary}
              onEdit={() => openEditModal(beneficiary)}
              onDelete={() => handleDelete(beneficiary.id)}
            />
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all flex items-center justify-center gap-2 h-20"
          >
            <iconify-icon icon="solar:add-circle-linear" width="24" />
            <span className="font-medium">Adaugă beneficiar nou</span>
          </button>
        </div>
      )}

      <AddBeneficiaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
      />

      <EditBeneficiaryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingBeneficiary(null)
        }}
        onSubmit={handleEdit}
        beneficiary={editingBeneficiary}
      />
    </>
  )
}