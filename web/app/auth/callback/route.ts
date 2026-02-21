import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // TEMPORARY TEST - remove after
  return new Response('Route handler is alive! URL: ' + request.url, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })

  const fullUrl = request.url
  console.log('[auth/callback] FULL URL:', fullUrl)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  console.log('[auth/callback] PARAMS:', { code, tokenHash: tokenHash?.substring(0, 10), type })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle email confirmation with token_hash
  if (tokenHash && type === 'signup') {
    console.log('[auth/callback] Attempting verifyOtp with token_hash:', tokenHash.substring(0, 10) + '...')
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'signup',
    })

    console.log('[auth/callback] verifyOtp result:', {
      success: !error,
      error: error?.message,
      errorCode: error?.status,
      hasSession: !!data?.session,
    })

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/confirmed`)
    }
    
    // Redirect with the actual error message
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Handle OAuth / PKCE flow with code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
