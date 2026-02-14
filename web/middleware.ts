import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/auth/')
  const isPublicFile = pathname.match(/\.(ico|png|jpg|svg|json)$/)

  const supabaseResponse = NextResponse.next()

  // 1. Initialize Supabase Client with proper SSR cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
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

  // 3. Secret Admin Route Protection
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

  // 4. Content Security Policy (Anti-Antivirus Shield)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.vercel.app https://vercel.live https://*.vercel.live https://code.iconify.design https://*.iconify.design;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel.app https://vercel.live https://*.vercel.live wss://*.vercel.live https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com;
    img-src 'self' blob: data: https://*.supabase.co https://vercel.com https://vercel.live;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src 'self' https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

  // 5. Cache prevention for protected pages
  if (!isPublicRoute) {
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|api/).*)',
  ],
}
