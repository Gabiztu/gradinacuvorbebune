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

  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; secure?: boolean }) {
          let cookie = `${name}=${encodeURIComponent(value)}`
          if (options.path) cookie += `; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options.secure) cookie += '; secure'
          cookie += '; samesite=lax'
          document.cookie = cookie
        },
        remove(name: string, options: { path?: string }) {
          document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )

  return clientInstance
}
