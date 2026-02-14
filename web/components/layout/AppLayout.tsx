'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useModalOverlay } from '@/contexts/ModalOverlayContext'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { cn } from '@/lib/utils'
import { ReactNode, useEffect } from 'react'

const navItems = [
  { href: '/', label: 'Acasă', icon: 'solar:home-smile-linear', key: 'home' },
  { href: '/biblioteca', label: 'Biblioteca', icon: 'solar:book-bookmark-linear', key: 'biblioteca' },
  { href: '/gradina', label: 'Grădina', icon: 'solar:leaf-linear', key: 'gradina' },
  { href: '/beneficiari', label: 'Beneficiari', icon: 'solar:users-group-rounded-linear', key: 'beneficiari' },
]

const mobileNavItems = [
  { href: '/', label: 'Acasă', icon: 'solar:home-smile-linear', key: 'home' },
  { href: '/biblioteca', label: 'Bibliotecă', icon: 'solar:book-bookmark-linear', key: 'biblioteca' },
  { href: '/gradina', label: '', icon: 'solar:leaf-linear', key: 'garden', center: true },
  { href: '/beneficiari', label: 'Copii', icon: 'solar:users-group-rounded-linear', key: 'beneficiari' },
  { href: '/profil', label: 'Profil', icon: 'solar:user-circle-linear', key: 'profil' },
]

function getPageKey(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/biblioteca')) return 'biblioteca'
  if (pathname.startsWith('/message/personalize')) return 'biblioteca'
  if (pathname.startsWith('/gradina')) return 'gradina'
  if (pathname.startsWith('/beneficiari')) return 'beneficiari'
  if (pathname.startsWith('/profil') || pathname.startsWith('/mgmt')) return 'profil'
  if (pathname.startsWith('/mesaj')) return 'mesaj'
  return 'home'
}

function DesktopSidebar() {
  const pathname = usePathname()
  const pageKey = getPageKey(pathname)
  const { user, profile } = useAuth()
  const { selectedBeneficiary } = useBeneficiary()

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between p-6 z-10 glass-panel border-r border-white/40 h-screen fixed left-0 top-0">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-300 to-rose-300 flex items-center justify-center text-white shadow-sm">
            <iconify-icon icon="solar:heart-angle-linear" width="18" />
          </div>
          <h1 className="flex flex-col text-[15px] font-bold tracking-tighter text-stone-800 uppercase">
            <span className="leading-none">Gradina cu</span>
            <span className="leading-none -mt-[3px]">Vorbe Bune</span>
          </h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pageKey === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all nav-item rounded-xl',
                  isActive
                    ? 'bg-white/60 shadow-sm border border-white/50 text-stone-800'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/40 font-normal'
                )}
              >
                <iconify-icon icon={item.icon} width="20" strokeWidth="1.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <Link href="/profil" className="glass-card p-4 rounded-2xl cursor-pointer hover:bg-white/60 block">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border border-white">
              {user ? (
                <div className="w-full h-full bg-gradient-to-b from-stone-100 to-stone-300 flex items-center justify-center text-xs font-medium">
                  {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-stone-100 to-stone-300 flex items-center justify-center text-xs font-medium">
                  AB
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
            <div>
            <p className="text-sm font-medium text-stone-800 leading-none">
              {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Alex B.'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Nivel {profile?.total_xp ? Math.floor(profile.total_xp / 250) + 1 : 1}
            </p>
          </div>
        </div>
      </Link>
    </aside>
  )
}

function MobileBottomNav() {
  const pathname = usePathname()
  const pageKey = getPageKey(pathname)

  return (
    <div className="md:hidden fixed bottom-0 w-full glass-panel border-t border-white/50 pb-safe z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-end py-2 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pageKey === item.key
          
          if (item.center) {
            return (
              <div key={item.key} className="relative -top-6">
                <Link
                  href={item.href}
                  className="w-14 h-14 rounded-full bg-stone-800 text-white flex items-center justify-center shadow-xl shadow-stone-800/30 active:scale-95 transition-transform border-[5px] border-[#FAFAF9]"
                >
                  <iconify-icon icon={item.icon} width="28" />
                </Link>
              </div>
            )
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 w-14 transition-colors',
                isActive ? 'text-stone-800' : 'text-stone-400'
              )}
            >
              <div className={cn(
                'icon-container transition-all duration-300 p-1 rounded-xl',
                isActive && 'bg-stone-100'
              )}>
                <iconify-icon icon={item.icon} width="22" strokeWidth="1.5" />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-opacity',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function MobileHeader() {
  const pathname = usePathname()
  const pageKey = getPageKey(pathname)
  const { profile } = useAuth()

  const pageTitles: Record<string, string> = {
    home: 'Acasă',
    biblioteca: 'Biblioteca',
    gradina: 'Grădina',
    beneficiari: 'Beneficiari',
    profil: 'Profil',
  }

  const title = pageTitles[pageKey] || 'Empatie'

  return (
    <div className="md:hidden flex items-center justify-between mb-0 sticky top-0 bg-white/0 backdrop-blur-sm z-50 py-4 px-1">
        <div className="flex items-center gap-2 ml-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-300 to-rose-300 flex items-center justify-center text-white">
            <iconify-icon icon="solar:heart-angle-linear" width="18" />
          </div>
          <h1 className="flex flex-col text-[15px] font-bold tracking-tighter text-stone-800 uppercase">
            <span className="leading-none">Grădina cu</span>
            <span className="leading-none -mt-[3px]">Vorbe Bune</span>
          </h1>
          <Link href="/gradina" className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 flex items-center gap-1 font-medium ml-32 hover:bg-green-100 transition-colors">
            <iconify-icon icon="solar:leaf-bold" width="12" />
            Nivel {profile?.total_xp ? Math.floor(profile.total_xp / 250) + 1 : 1}
          </Link>
        </div>
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { loading } = useAuth()
  const { isModalOpen } = useModalOverlay()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  const isPublicPage = pathname === '/login' || pathname.startsWith('/auth/')
  const showNav = !loading && !isPublicPage && !!pathname

  return (
    <div className="min-h-screen">
      {showNav && <DesktopSidebar />}
      
      <motion.div
        className={cn(
          'flex-1 h-[100dvh] flex flex-col no-scrollbar relative scroll-smooth',
          showNav ? 'md:pl-64' : ''
        )}
        animate={{
          filter: isModalOpen ? 'blur(8px) scale(0.98)' : 'blur(0px) scale(1)',
        }}
        transition={{ duration: 0.3 }}
      >
        {showNav && <MobileHeader />}
        
        <main className="flex-1 overflow-y-auto">
          <div className={cn(
            'pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-10',
            showNav ? 'p-6 md:p-10' : ''
          )}>
            {children}
            <div className="h-10 md:hidden" />
          </div>
        </main>

        {showNav && <MobileBottomNav />}
      </motion.div>
    </div>
  )
}