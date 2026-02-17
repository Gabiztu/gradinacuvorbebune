'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, role: 'parent' | 'teacher') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshUser: () => Promise<void>
  clearInvalidSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const isMounted = useRef(true)

  const refreshProfile = useCallback(async () => {
    if (!isMounted.current) return
    
    try {
      // ALWAYS get fresh session - don't rely on closure
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      
      if (!userId) {
        if (isMounted.current) {
          setUser(null)
          setProfile(null)
        }
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching profile:', profileError.message)
      } else if (profileData) {
        if (isMounted.current) {
          setProfile(profileData as Profile)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Unexpected Auth Error:', err)
    }
  }, [supabase])

  const clearInvalidSession = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (e) {
      console.error('Error clearing session:', e)
    }
    if (isMounted.current) {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let isCleanup = false

    const initAuth = async () => {
      // Safety timeout - force loading=false after 3 seconds
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setLoading(false)
        }
      }, 3000)

      try {
        const { data, error } = await supabase.auth.getSession()

        // Clear timeout if request completed
        clearTimeout(timeoutId)

        if (error) {
          if (isMounted.current) {
            setLoading(false)
          }
          return
        }

        if (data?.session?.user) {
          setUser(data.session.user)
          // Don't await - let profile load in background
          refreshProfile().finally(() => {
            if (isMounted.current) {
              setLoading(false)
            }
          })
        } else {
          if (isMounted.current) {
            setLoading(false)
          }
        }
      } catch (err) {
        clearTimeout(timeoutId)
        if (err instanceof Error && err.name === 'AbortError') return
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (isCleanup || !isMounted.current) return

        try {
          if (session) {
            setUser(session.user)
            await refreshProfile()
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return
          console.error('Auth state change error:', err)
        }
      }
    )

    return () => {
      isCleanup = true
      isMounted.current = false
      subscription.unsubscribe()
    }
  }, [supabase, refreshProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string, role: 'parent' | 'teacher') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    })

    if (error) {
      return { error: error ? new Error(error.message) : null }
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          role: role,
          total_xp: 0,
          streak_count: 0,
          last_active_date: new Date().toISOString().split('T')[0],
        })

      if (profileError) {
        console.error('Profile creation error:', profileError.message)
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    setUser(null)
    setProfile(null)
  }

  const refreshUser = async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error refreshing user:', error.message)
        return
      }

      if (updatedUser) {
        setUser(updatedUser)
        await refreshProfile()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Error refreshing user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshUser,
        clearInvalidSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
