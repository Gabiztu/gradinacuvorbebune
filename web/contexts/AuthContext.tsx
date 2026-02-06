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
  const isInitialized = useRef(false)

  const refreshProfile = useCallback(async () => {
  try {
    // Încercăm să luăm ID-ul fie din state, fie direct dintr-o sesiune proaspătă
    let userId = user?.id;
    
    if (!userId) {
      const { data: sData } = await supabase.auth.getSession();
      userId = sData.session?.user?.id;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('Fetching profile for:', userId); // Debug log

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      setProfile(null);
    } else if (profileData) {
      console.log('Profile loaded:', profileData); // Debug log
      setProfile(profileData as Profile);
    }

  } catch (err) {
    console.error('Unexpected Auth Error:', err);
  } finally {
    setLoading(false);
  }
}, [user?.id, supabase]);

  const clearInvalidSession = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (e) {
      console.error('Error clearing session:', e)
    }
    setUser(null)
    setProfile(null)
    setLoading(false)
    isInitialized.current = false
  }, [supabase])

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error.message)
          setLoading(false)
          return
        }

        if (data?.session) {
          setUser(data.session.user)
          await refreshProfile()
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Session check failed:', err)
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session) {
          setUser(session.user)
          await refreshProfile()
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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
