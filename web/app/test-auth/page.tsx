'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [status, setStatus] = useState('Testing...')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'parent' | 'teacher'>('parent')
  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').single()
      if (error) {
        setStatus('Profile table issue: ' + error.message)
      } else {
        setStatus('Connected! Profile table accessible.')
      }
    } catch (e: any) {
      setStatus('Connection error: ' + e.message)
    }
  }

  const handleSignUp = async () => {
    setStatus('Signing up...')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    })

    if (error) {
      setStatus('Signup error: ' + error.message)
    } else {
      setStatus('Signup success! User created.')
    }
  }

  const handleSignIn = async () => {
    setStatus('Signing in...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setStatus('Signin error: ' + error.message)
    } else {
      setStatus('Signin success!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <p className="mb-4">{status}</p>
      
      <div className="space-y-4 max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value as 'parent' | 'teacher')}
          className="w-full p-2 border rounded"
        >
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
        </select>

        <div className="flex gap-2">
          <button 
            onClick={handleSignUp}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Sign Up
          </button>
          <button 
            onClick={handleSignIn}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
