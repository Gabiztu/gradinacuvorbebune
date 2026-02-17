'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Message } from '@/types'

interface FavoritesContextType {
  favorites: string[]
  favoritesMessages: Message[]
  favoritesCount: number
  isFavorite: (messageId: string) => boolean
  toggleFavorite: (messageId: string, messageData?: Pick<Message, 'id' | 'content' | 'category'>) => Promise<void>
  loading: boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoritesMessages, setFavoritesMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user } = useAuth()

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setFavoritesMessages([])
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('favorites')
        .select('message_id, created_at, messages:message_id(id, content, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (data) {
        const ids = data.map(f => f.message_id)
        setFavorites(ids)
        
        const messages = data
          .map((f: any) => ({
            ...f.messages,
            favorited_at: f.created_at,
          }))
          .filter((m): m is Message & { favorited_at: string } => m !== null && m !== undefined && m.id && m.content)
          .reduce((acc: (Message & { favorited_at: string })[], current: Message & { favorited_at: string }) => {
            const exists = acc.find(m => m.id === current.id)
            if (!exists) acc.push(current)
            return acc
          }, [])
        setFavoritesMessages(messages as Message[])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Favorites fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useCallback((messageId: string) => {
    return favorites.includes(messageId)
  }, [favorites])

  const toggleFavorite = useCallback(async (messageId: string, messageData?: Pick<Message, 'id' | 'content' | 'category'>) => {
    if (!user) return

    const currentlyFavorite = favorites.includes(messageId)
    const now = new Date().toISOString()

    if (currentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== messageId))
      setFavoritesMessages(prev => prev.filter(m => m.id !== messageId))
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('message_id', messageId)
    } else {
      setFavorites(prev => [messageId, ...prev])
      if (messageData) {
        setFavoritesMessages(prev => {
          if (prev.find(m => m.id === messageId)) return prev
          return [messageData as Message, ...prev]
        })
      }
      await supabase.from('favorites').insert({ user_id: user.id, message_id: messageId, created_at: now })
    }
  }, [favorites, supabase, user])

  const favoritesCount = favorites.length

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesMessages,
        favoritesCount,
        isFavorite,
        toggleFavorite,
        loading,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
