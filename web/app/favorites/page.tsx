'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Star, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          message_id,
          messages:message_id (*)
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching favorites:', error)
        toast.error('Nu s-au putut încărca favoritele')
      } else if (data) {
        const messages = data.map((f: any) => f.messages).filter(Boolean)
        setFavorites(messages as Message[])
      }

      setLoading(false)
    }

    fetchFavorites()
  }, [user])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f4] via-[#f0efe9] to-[#e8e6df]">
      <header className="p-6 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="warning">⭐</Badge>
          <h1 className="text-3xl font-bold text-gray-900">
            Favorite
          </h1>
        </div>
        <p className="text-gray-600 text-sm ml-1">
          Mesajele tale salvate pentru acces rapid
        </p>
      </header>

      <div className="p-4 pb-28 space-y-4">
        {favorites.length === 0 ? (
          <Card className="text-center py-12" padding="lg">
            <div className="w-20 h-20 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-amber-400" />
            </div>
            <p className="text-gray-500 mb-6">Nu aveți mesaje favorite încă.</p>
            <Link 
              href="/library" 
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
            >
              <Sparkles className="w-4 h-4" />
              Exploră biblioteca
            </Link>
          </Card>
        ) : (
          favorites.map((message) => (
            <Card 
              key={message.id} 
              className="relative overflow-hidden"
              padding="lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <p className="text-gray-800 text-lg leading-relaxed mb-6 relative z-10">
                {message.content}
              </p>
              
              <Link
                href={`/message/${message.id}`}
                className="group relative flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
              >
                <span>Trimite acest mesaj</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>
          ))
        )}
      </div>

      <div className="safe-area-inset-bottom" />
    </div>
  )
}
