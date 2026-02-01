'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { cn } from '@/lib/utils'
import { Sprout, BookOpen, Users, LogOut, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function BottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { openModal, closeModal } = useModal()

  const navItems = [
    { href: '/', label: 'Grădina', icon: Sprout },
    { href: '/biblioteca', label: 'Cuvinte', icon: BookOpen },
    { href: '/beneficiaries', label: 'Copiii', icon: Users },
  ]

  const isPathActive = (href: string) => {
    if (pathname === href) return true
    if (href === '/biblioteca' && (pathname.startsWith('/biblioteca') || pathname.startsWith('/message/personalize'))) return true
    return false
  }

  const handleSignOut = async () => {
    closeModal('logout')
    await signOut()
    window.location.href = '/login'
  }

  const handleLogoutClick = () => {
    const modalContent = (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100/80 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ești sigur?</h3>
        <p className="text-gray-600 text-sm mb-6">Dorești să te deconectezi din aplicație?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => closeModal('logout')} className="flex-1">
            <X className="w-4 h-4 mr-2" />Anulează
          </Button>
          <Button variant="danger" onClick={handleSignOut} className="flex-1">
            <Check className="w-4 h-4 mr-2" />Da, ieșire
          </Button>
        </div>
      </div>
    )
    openModal('logout', 'Deconectare', modalContent, () => closeModal('logout'))
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/60 backdrop-blur-[15px] border-t border-white/40 safe-area-inset-bottom">
        <div className="relative flex items-center justify-around h-13 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = isPathActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-full px-3 transition-all duration-300',
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="relative p-2 rounded-xl transition-all duration-300">
                  <Icon
                    className={cn('w-5 h-5 transition-transform duration-300', isActive && 'scale-110')}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn('text-[12px] mt-0 font-medium transition-all duration-300', isActive && 'text-primary-600')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {user && (
            <button
              onClick={handleLogoutClick}
              className="relative flex flex-col items-center justify-center flex-1 h-full px-3 text-gray-500 hover:text-red-600 transition-all duration-300"
            >
              <div className="p-2 rounded-xl hover:bg-red-50/80 transition-colors">
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-[12px] mt-0 font-medium">Exit</span>
            </button>
          )}
          
          {navItems.map((item, index) => {
            const isActive = isPathActive(item.href)
            if (!isActive) return null
            
            const totalNavItems = user ? navItems.length + 1 : navItems.length
            
            return (
              <motion.div
                key="nav-active-indicator"
                layoutId="nav-active-indicator"
                className="absolute -top-0.5 h-0.5 bg-primary-500"
                style={{ 
                  left: `${(index / totalNavItems) * 100}%`,
                  width: `${100 / totalNavItems}%`
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )
          })}
        </div>
      </div>
    </nav>
  )
}
