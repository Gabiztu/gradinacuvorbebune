import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (clientInstance) {
    return clientInstance
  }

  console.log('[SupabaseClient] Creating new browser client')
  
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
          const result = cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
          if (name.includes('sb-') || name.includes('auth')) {
            console.log('[SupabaseClient] Cookie get:', name, result ? 'exists' : 'null')
          }
          return result
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; secure?: boolean }) {
          let cookie = `${name}=${encodeURIComponent(value)}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options.secure) cookie += '; secure'
          cookie += '; samesite=lax'
          document.cookie = cookie
          if (name.includes('sb-') || name.includes('auth')) {
            console.log('[SupabaseClient] Cookie set:', name)
          }
        },
        remove(name: string, options: { path?: string }) {
          document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          if (name.includes('sb-') || name.includes('auth')) {
            console.log('[SupabaseClient] Cookie remove:', name)
          }
        },
      },
    }
  )

  return clientInstance
}
