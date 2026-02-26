'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  return <AuthForm initialMode={mode === 'signup' ? 'signup' : 'login'} />
}

function LoginFormFallback() {
  return <AuthForm initialMode="login" />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  )
}
