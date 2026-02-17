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
          const cookies = document.cookie.split('; ')
          
          // 1. Încearcă cookie-ul direct (valoare mică)
          const direct = cookies.find(row => row.startsWith(`${name}=`))
          if (direct) {
            return decodeURIComponent(direct.split('=')[1])
          }

          // 2. Încearcă cookie-uri cu sufixe (.0, .1, .2, ...)
          const parts: string[] = []
          let i = 0
          while (true) {
            const part = cookies.find(row => row.startsWith(`${name}.${i}=`))
            if (!part) break
            parts.push(decodeURIComponent(part.split('=')[1]))
            i++
          }

          if (parts.length > 0) {
            return parts.join('')
          }

          return undefined
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
          // Șterge cookie-ul principal
          document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          
          // Șterge și cookie-urile cu sufixe
          for (let i = 0; i < 10; i++) {
            document.cookie = `${name}.${i}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        },
      },
    }
  )

  return clientInstance
}
