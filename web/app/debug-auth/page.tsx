'use client'

import { useState, useEffect } from 'react'

export default function DebugAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [email, setEmail] = useState('testnew@example.com')
  const [password, setPassword] = useState('123456')
  const [role, setRole] = useState('parent')

  const testSignup = async () => {
    setResult({ status: 'Testing...' })

    const SUPABASE_URL = 'https://xukhmcmpmfrjejyqdkwe.supabase.co'
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1a2htY21wbWZyamVqeXFka3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTU5MDIsImV4cCI6MjA4MzkzMTkwMn0.er6xD56DtjK_5hJYXcZqQ1CFbW6nJWqscLcWZyhza6I'

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({
          email: email,
          password: password,
          data: {
            role: role
          }
        })
      })

      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data
      })
    } catch (e: any) {
      setResult({
        error: e.message
      })
    }
  }

  const testSignin = async () => {
    setResult({ status: 'Testing sign in...' })

    const SUPABASE_URL = 'https://xukhmcmpmfrjejyqdkwe.supabase.co'
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1a2htY21wbWZyamVqeXFka3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTU5MDIsImV4cCI6MjA4MzkzMTkwMn0.er6xD56DtjK_5hJYXcZqQ1CFbW6nJWqscLcWZyhza6I'

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data
      })
    } catch (e: any) {
      setResult({
        error: e.message
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Supabase Auth</h1>
      
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password (min 6 chars)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        flex gap-2<div className="">
          <button
            onClick={testSignup}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Signup
          </button>
          <button
            onClick={testSignin}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Test Signin
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
