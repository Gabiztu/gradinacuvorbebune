'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordContent() {
  const [status, setStatus] = useState<'loading' | 'verify' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'recovery') {
      setStatus('error')
      setErrorMessage('Link-ul de resetare este invalid.')
      return
    }

    const verify = async () => {
      const supabase = createClient()
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      })

      if (error) {
        console.error('[ResetPassword] verifyOtp error:', error.message)
        setStatus('error')
        setErrorMessage('Link-ul a expirat sau este invalid. Te rog soliciți o nouă resetare a parolei.')
      } else {
        setStatus('verify')
      }
    }

    verify()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || password.length < 6) {
      setErrorMessage('Parola trebuie să aibă cel puțin 6 caractere.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Parolele nu se potrivesc.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMessage('Eroare la actualizarea parolei: ' + error.message)
      } else {
        // Sign out to require manual login with new password
        await supabase.auth.signOut()
        setStatus('success')
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      }
    } catch (err) {
      setErrorMessage('A apărut o eroare. Te rog încearcă din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Se verifică link-ul...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center mx-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✕</span>
          </div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">Eroare</h1>
          <p className="text-stone-500">{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center mx-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">Parola a fost resetată!</h1>
          <p className="text-stone-500 mb-2">Acum te poți loga cu noua parolă.</p>
          <p className="text-sm text-stone-400">În câteva secunde vei fi redirecționat...</p>
        </div>
      </div>
    )
  }

  // status === 'verify' - show password form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mx-4">
        <h1 className="text-xl font-semibold text-stone-800 mb-2 text-center">Resetează parola</h1>
        <p className="text-stone-500 mb-6 text-center">Introdu noua ta parolă</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Parola nouă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
              placeholder="Minim 6 caractere"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Confirmă parola</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
              placeholder="Confirmă parola"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Se salvează...' : 'Salvează parola'}
          </button>
        </form>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500">Se verifică link-ul...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
