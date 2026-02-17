'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { createClient } from '@/lib/supabase/client'
import { X, Check } from 'lucide-react'

export default function ProfilPage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile, refreshUser } = useAuth()
  const { beneficiaries } = useBeneficiary()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined' && window.location.search.includes('refresh=true')) {
      refreshProfile()
      window.history.replaceState({}, '', '/profil')
    }
  }, [])

  useEffect(() => {
    if (user?.user_metadata?.first_name) {
      setEditName(user.user_metadata.first_name)
    } else if (user?.email) {
      setEditName(user.email.split('@')[0])
    }
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    localStorage.clear()
    sessionStorage.clear()
    window.location.replace('/login')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    setDeleting(true)
    setDeleteError(null)
    
    try {
      const supabase = createClient()
      
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.from('beneficiaries').delete().eq('user_id', user.id)
      await supabase.from('favorites').delete().eq('user_id', user.id)
      await supabase.from('history').delete().eq('user_id', user.id)
      
      await supabase.auth.admin.deleteUser(user.id)
      
      await supabase.auth.signOut({ scope: 'global' })
      localStorage.clear()
      sessionStorage.clear()
      
      window.location.replace('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteError('Nu am putut șterge contul. Încearcă din nou.')
    } finally {
      setDeleting(false)
    }
  }


  if (signingOut) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Se deconectează...</p>
        </div>
      </div>
    )
  }

  if (!mounted || authLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded mb-8" />
        <div className="h-40 bg-stone-200 rounded-3xl mb-6" />
        <div className="space-y-4">
          <div className="h-20 bg-stone-200 rounded-2xl" />
          <div className="h-20 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  const xp = profile?.total_xp || 0
  const level = Math.floor(xp / 250) + 1
  const streak = profile?.streak_count || 0

  const handleSaveName = async () => {
    if (!editName.trim() || !user) return
    
    console.log('[ProfilePage] handleSaveName - userId:', user.id, 'newName:', editName.trim())
    setSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.updateUser({
        data: { first_name: editName.trim() }
      })
      
      if (error) {
        console.error('[ProfilePage] handleSaveName error:', error.message, error.code)
        throw error
      }
      
      console.log('[ProfilePage] handleSaveName success:', data)
      await refreshUser()
      await refreshProfile()
      router.refresh()
      setIsEditing(false)
    } catch (error) {
      console.error('[ProfilePage] Error updating name:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(user?.user_metadata?.first_name || user?.email?.split('@')[0] || '')
    setIsEditing(false)
  }

  const currentName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''
  const userEmail = user?.email || ''

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-2">
          Profil.
        </h2>
        <p className="text-stone-500 font-light">
          Gestionează contul și preferințele.
        </p>
      </header>

      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* decorative background blur inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="w-24 h-24 rounded-full bg-stone-200 border-4 border-white shadow-sm flex items-center justify-center text-2xl font-medium text-stone-600">
          {currentName?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          {isEditing ? (
            <div className="flex flex-col items-center md:items-start gap-2 mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="glass-input px-3 py-2 w-full md:w-48 text-center md:text-left text-lg font-semibold text-stone-800"
                placeholder="Numele tău"
                disabled={saving}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving || !editName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Salvează
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Anulează
                </button>
              </div>
            </div>
          ) : (
            <h3 className="text-xl font-semibold text-stone-800">
              {currentName}
            </h3>
          )}
          <p className="text-stone-400 text-sm mb-4">{userEmail}</p>
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100 flex items-center gap-1">
              <iconify-icon icon="solar:leaf-bold" width="10" />
              Nivel {level}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 flex items-center gap-1">
              <iconify-icon icon="solar:star-linear" width="10" />
              {xp} XP
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100 flex items-center gap-1">
              <iconify-icon icon="solar:fire-bold" width="10" />
              {streak} zile
            </span>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors z-10 bg-white/50"
          >
            Editează
          </button>
        )}
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 pl-2">
          Opțiuni
        </h3>

        <div className="glass-card rounded-2xl overflow-hidden">
          {profile?.is_admin && (
            <Link
              href="/mgmt-x9f2b8c71"
              className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <iconify-icon icon="solar:shield-check-linear" width="20" />
                </div>
                <span className="text-sm font-medium text-stone-800">
                  Panou Administrare
                </span>
              </div>
              <iconify-icon icon="solar:alt-arrow-right-linear" class="text-stone-300" />
            </Link>
          )}

          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <iconify-icon icon="solar:shield-check-linear" width="20" />
              </div>
              <span className="text-sm font-medium text-stone-800">
                Politica de confidențialitate
              </span>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" class="text-stone-300" />
          </button>

          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors text-left group border-t border-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-50 text-stone-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <iconify-icon icon="solar:logout-2-linear" width="20" />
              </div>
              <span className="text-sm font-medium text-stone-800">Deconectare</span>
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full p-4 rounded-2xl border border-red-100 text-red-600 bg-red-50/30 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors mt-8"
        >
          <iconify-icon icon="solar:trash-bin-trash-linear" width="18" />
          <span className="text-sm font-medium">Șterge Contul</span>
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF9] rounded-t-[32px] p-6 pb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-stone-800">
                Șterge Contul
              </h3>
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-600 mb-6">
              Ești sigur că vrei să ștergi contul? Această acțiune este ireversibilă și toate datele tale vor fi pierdute definitiv.
            </p>

            {deleteError && (
              <p className="text-red-500 text-sm mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-600 font-medium text-sm hover:bg-stone-300 transition-colors disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Se șterge...
                  </>
                ) : (
                  'Șterge Contul'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowPrivacyModal(false)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowPrivacyModal(false)} />
              <div className="relative z-50 bg-[#FAFAF9] rounded-[32px] p-6 pb-8 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-stone-800">
                    Politica de Confidențialitate
                  </h3>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
                  <p className="font-medium text-stone-800">1. Introducere</p>
                  <p>
                    Bine ai venit la Gradina cu Vorbe Bune. Ne angajăm să protejăm confidențialitatea ta. Această politică explică cum colectăm, folosim și protejăm informațiile tale.
                  </p>

                  <p className="font-medium text-stone-800">2. Informații Colectate</p>
                  <p>
                    Collectăm informații pe care ni le furnizezi direct: numele, adresa de email și informațiile despre beneficiari (copiii pentru care trimiți mesaje). De asemenea, colectăm date despre activitatea ta în aplicație, precum mesajele trimise și preferințele.
                  </p>

                  <p className="font-medium text-stone-800">3. Cum Folosim Informațiile</p>
                  <p>
                    Folosim informațiile tale pentru a-ți oferi experiența personalizată, a trimite mesajele tale și a îmbunătăți aplicația. Nu vindem informațiile tale către terți.
                  </p>

                  <p className="font-medium text-stone-800">4. Stocarea Datelor</p>
                  <p>
                    Datele tale sunt stocate în siguranță pe serverele noastre. Accesul la aceste date este restricționat echipei noastre și nu este partajat cu terți neautorizați.
                  </p>

                  <p className="font-medium text-stone-800">5. Drepturile Tale</p>
                  <p>
                    Ai dreptul să accesezi, corectezi sau ștergi informațiile tale în orice moment. Poți solicita ștergerea contului din secțiunea Profil.
                  </p>

                  <p className="font-medium text-stone-800">6. Contact</p>
                  <p>
                    Pentru întrebări despre această politică sau despre datele tale, ne poți contacta prin email.
                  </p>

                  <p className="text-xs text-stone-400 pt-4 border-t border-stone-200">
                    Ultima actualizare: Ianuarie 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
