'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ConfirmedContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash) {
      // No token_hash means user was redirected here after Supabase verified
      // Just check if we have a session
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
        if (data.session) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage('Link-ul de confirmare este invalid.')
        }
      })
      return
    }

    // We have a token_hash - verify it CLIENT-SIDE
    // verifyOtp does NOT require PKCE (unlike exchangeCodeForSession)
    const verify = async () => {
      const supabase = createClient()
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: (type as 'signup' | 'email') || 'signup',
      })

      if (error) {
        console.error('[Confirmed] verifyOtp error:', error.message)
        setStatus('error')
        setErrorMessage('Link-ul a expirat sau este invalid. Te rog creează un cont nou.')
      } else {
        setStatus('success')
        // Session is now created in THIS browser
        // onAuthStateChange will fire in ALL tabs (including Tab A)
        // Tab A will auto-login!
      }
    }

    verify()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Se verifică contul...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✕</span>
          </div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">Eroare</h1>
          <p className="text-stone-500">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Contul tău a fost confirmat!</h1>
        <p className="text-stone-500">Poți închide acest tab.</p>
      </div>
    </div>
  )
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Se încarcă...</p>
        </div>
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  )
}
