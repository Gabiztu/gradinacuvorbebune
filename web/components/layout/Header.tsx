'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    toast.success('Te-ai deconectat cu succes')
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {profile?.role || 'Părinte'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
