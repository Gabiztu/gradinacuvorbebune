'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { PasswordInput } from './PasswordInput'
import { useTransientPassword } from '@/hooks/useTransientPassword'

export function AuthForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'parent' | 'teacher'>('parent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [mounted, setMounted] = useState(false)

  const passwordField = useTransientPassword(isSignUp ? 'signup' : 'login')
  const confirmPasswordField = useTransientPassword('confirm')

  useEffect(() => {
    setMounted(true)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  const validateEmail = (value: string): string | null => {
    if (!value) return 'Email-ul este obligatoriu.'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ro|org|net|eu|io|info|md|edu)$/i
    if (!emailRegex.test(value)) {
      return 'Email invalid. Exemplu: nume@domeniu.com'
    }
    return null
  }

  const validatePassword = (value: string): string | null => {
    if (!value) return 'Parola este obligatorie.'
    if (value.length < 6) return 'Minimum 6 caractere.'
    return null
  }

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }))
    setEmailError(validateEmail(email))
  }

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }))
    setEmailError(validateEmail(email))
    setPasswordError(validatePassword(passwordField.getValue()))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    passwordField.onChange(e)
    if (touched.password) {
      setPasswordError(validatePassword(passwordField.getValue()))
    }
  }

  const setPasswordError = (err: string | null) => {
    if (isSignUp) {
      setEmailError(err)
    }
  }

  const isFormValid = () => {
    const password = passwordField.getValue()
    if (isSignUp) {
      return email && password.length >= 6 && !validateEmail(email) && !validatePassword(password)
    }
    return email && password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTouched({ email: true, password: true })

    const emailErr = validateEmail(email)
    const password = passwordField.getValue()
    const passwordErr = validatePassword(password)

    if (emailErr || passwordErr) {
      setEmailError(emailErr)
      if (isSignUp) {
        setEmailError(passwordErr)
      }
      setError('Te rog completează toate câmpurile corect.')
      return
    }

    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role }
          }
        })
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password
        })
      }

      if (result.error) {
        let errorMsg = result.error.message
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Email sau parolă incorectă.'
        } else if (errorMsg.includes('User already registered')) {
          errorMsg = 'Acest email este deja înregistrat.'
        } else if (errorMsg.includes('Password')) {
          errorMsg = 'Parola trebuie să aibă minimum 6 caractere.'
        }
        setError(errorMsg)
      } else {
        if (isSignUp && result.data.session === null) {
          setError('Verifică email-ul pentru confirmare.')
          setLoading(false)
          return
        }
        setLoading(false)
        setTimeout(() => {
          window.location.href = '/'
        }, 300)
      }
    } catch {
      setError('A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError(null)
    setEmailError(null)
    setTouched({ email: false, password: false })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-green-100/40 rounded-full blur-[100px] top-[-100px] left-[-100px]" />
        <div className="absolute w-80 h-80 bg-rose-100/40 rounded-full blur-[100px] bottom-[-50px] right-[-50px]" />
        <div className="absolute w-64 h-64 bg-amber-100/40 rounded-full blur-[100px] top-[40%] left-[60%]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-300 to-rose-300 flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
        </div>

        <h1 className="flex flex-col text-2xl font-bold tracking-tighter text-stone-800 uppercase mb-2">
          <span className="leading-none">Grădina cu</span>
          <span className="leading-none -mt-1">Vorbe Bune</span>
        </h1>

        <p className="text-stone-500 text-center max-w-xs mb-6 font-light">
          {isSignUp
            ? 'Începe să inspiri copiii cu mesaje frumoase'
            : 'Bine ai revenit! Ce ai în minte astăzi?'}
        </p>

        <span className="px-4 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200 mb-6">
          {isSignUp ? 'Creează-ți contul' : 'Autentificare'}
        </span>

        <motion.div 
          key={isSignUp ? 'auth-signup' : 'auth-login'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass-panel rounded-3xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-lg border border-red-200/50 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-stone-700 ml-1">
                  Sunt
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      role === 'parent'
                        ? 'border-stone-800 bg-white shadow-md'
                        : 'border-stone-200 hover:border-stone-300 bg-white/60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      role === 'parent' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-stone-800">Părinte</span>
                    {role === 'parent' && (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-stone-800" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      role === 'teacher'
                        ? 'border-stone-800 bg-white shadow-md'
                        : 'border-stone-200 hover:border-stone-300 bg-white/60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      role === 'teacher' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-stone-800">Profesor</span>
                    {role === 'teacher' && (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-stone-800" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (touched.email) {
                      setEmailError(validateEmail(e.target.value))
                    }
                  }}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-lg border rounded-xl focus:outline-none transition-all ${
                    emailError && touched.email
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-white/40 focus:border-stone-400/50'
                  }`}
                  placeholder="email@exemplu.com"
                />
              </div>
              {emailError && touched.email && (
                <p className="ml-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <PasswordInput
              field={passwordField}
              label="Parolă"
              placeholder="••••••••"
              error={isSignUp ? null : null}
              touched={touched.password}
              onBlur={handlePasswordBlur}
            />

            {isSignUp && (
              <PasswordInput
                field={confirmPasswordField}
                label="Confirmă parola"
                placeholder="••••••••"
                error={confirmPasswordField.getValue() !== passwordField.getValue() && confirmPasswordField.getValue().length > 0 ? 'Parolele nu se potrivesc' : null}
                touched={confirmPasswordField.getValue().length > 0}
                onBlur={() => {}}
              />
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-lg hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (isSignUp && !isFormValid())}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Se încarcă...
                </span>
              ) : isSignUp ? (
                'Creează cont'
              ) : (
                'Conectează-te'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              {isSignUp
                ? <><span className="underline decoration-dotted">Ai deja cont?</span> Conectează-te</>
                : <><span className="underline decoration-dotted">Nu ai cont?</span> Creează unul</>}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="p-6 text-center relative z-10">
        <p className="text-xs text-stone-400">
          Prin continuare, accepți Termenii și Condițiile
        </p>
      </div>

      <div className="safe-area-inset-bottom" />
    </div>
  )
}
