import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware entirely for auth callback routes
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // Skip middleware for email confirmation page
  if (pathname === '/cont-confirmat') {
    return NextResponse.next()
  }

  // Skip middleware for password reset page
  if (pathname === '/resetare-parola') {
    return NextResponse.next()
  }

  const isPublicRoute = pathname === '/login' || pathname.startsWith('/auth/') || pathname === '/cont-confirmat' || pathname === '/resetare-parola'
  const isPublicFile = pathname.match(/\.(ico|png|jpg|svg|json|webmanifest)$/)

  const supabaseResponse = NextResponse.next()

  // 1. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 2. Auth Redirects
  if (!session && !isPublicRoute && !isPublicFile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 3. Admin Protection
  if (pathname.startsWith('/mgmt-x9f2b8c71')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url))
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', session.user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.is_admin === true
    if (!isAdmin) return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Content Security Policy - CLEAN VERSION
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://vercel.live https://*.vercel.live https://code.iconify.design",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://*.vercel.live wss://*.vercel.live wss://*.pusher.com https://*.pusher.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com",
    "img-src 'self' blob: data: https://*.supabase.co https://vercel.com https://vercel.live",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://vercel.live https://*.vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

  // 5. Cache - Prevent browser back/forward cache for protected routes
  // Only apply strict cache headers to protected routes
  if (!isPublicRoute && !isPublicFile) {
    supabaseResponse.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, proxy-revalidate')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
    supabaseResponse.headers.set('Surrogate-Control', 'no-store')
  } else {
    // Public routes can be cached
    supabaseResponse.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Exclude:
     * - _next/static (JS/CSS bundles)
     * - _next/image (image optimization)
     * - _next/data (page data)
     * - Static files
     * - API routes
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|icon\\.svg|icon-.*\\.png|images/|api/).*)',
  ],
}