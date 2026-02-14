/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes except static assets
        source: '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icon.svg|images/).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Added vercel.live and vercel.com for Vercel's internal tools
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.vercel.app https://vercel.live https://*.vercel.live https://code.iconify.design https://*.iconify.design",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
              // Added wss:// for Vercel and Supabase real-time connections
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel.app https://vercel.live https://*.vercel.live wss://*.vercel.live https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com",
              "img-src 'self' blob: data: https://*.supabase.co https://vercel.com https://vercel.live",
              "font-src 'self' data: https://fonts.gstatic.com",
              // Added frame-src because Vercel Live uses iframes
              "frame-src 'self' https://vercel.live",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ],
      },
    ]
  },
}

module.exports = nextConfig
