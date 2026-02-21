'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const supabase = createClient()
      
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const type = params.get('type')

      if (!token || !type) {
        setStatus('error')
        setErrorMessage('Link-ul de confirmare este invalid.')
        return
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: type as 'signup' | 'email_change' | 'recovery',
        })

        if (error) {
          console.error('Verification error:', error.message)
          setStatus('error')
          setErrorMessage('Ups, a aparut o eroare, te rog reincearca.')
        } else {
          setStatus('success')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setErrorMessage('Ups, a aparut o eroare, te rog reincearca.')
      }
    }

    verifyEmail()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Se confirma contul...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Contul a fost confirmat!</h2>
            <p className="text-gray-600 mb-4">Acum te poți întoarce pe pagina de login.</p>
            <p className="text-sm text-gray-500">Poți închide această tab-ul.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Eroare la confirmare</h2>
            <p className="text-gray-600">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  )
}
