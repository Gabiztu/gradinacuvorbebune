'use client'

import { createClient } from '@/lib/supabase/client'

export default function SimpleTestPage() {
  const supabase = createClient()

  const handleSignup = async () => {
    const email = (document.getElementById('email') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value
    const role = (document.getElementById('role') as HTMLSelectElement).value
    const output = document.getElementById('output')

    output!.textContent = 'Signing up...'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    })

    if (error) {
      output!.textContent = `Error: ${error.message}\nStatus: ${error.status}`
    } else {
      output!.textContent = `Success!\nUser: ${JSON.stringify(data.user, null, 2)}\nSession: ${JSON.stringify(data.session, null, 2)}`
    }
  }

  const handleSignin = async () => {
    const email = (document.getElementById('email') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value
    const output = document.getElementById('output')

    output!.textContent = 'Signing in...'

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      output!.textContent = `Error: ${error.message}\nStatus: ${error.status}`
    } else {
      output!.textContent = `Success!\nUser: ${JSON.stringify(data.user, null, 2)}`
    }
  }

  const checkSession = async () => {
    const output = document.getElementById('output')
    
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      output!.textContent = `Session exists:\n${JSON.stringify(session.user, null, 2)}`
    } else {
      output!.textContent = 'No session'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Auth Test</h1>
      
      <div className="space-y-4 max-w-md">
        <input id="email" type="email" placeholder="Email" defaultValue="test@example.com" className="w-full p-2 border rounded" />
        <input id="password" type="password" placeholder="Password (min 6 chars)" defaultValue="123456" className="w-full p-2 border rounded" />
        
        <select id="role" className="w-full p-2 border rounded">
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
        </select>

        <div className="flex gap-2">
          <button onClick={handleSignup} className="px-4 py-2 bg-blue-500 text-white rounded">Signup</button>
          <button onClick={handleSignin} className="px-4 py-2 bg-green-500 text-white rounded">Signin</button>
          <button onClick={checkSession} className="px-4 py-2 bg-gray-500 text-white rounded">Check Session</button>
        </div>

        <pre id="output" className="mt-4 p-4 bg-gray-100 rounded text-sm"></pre>
      </div>
    </div>
  )
}
