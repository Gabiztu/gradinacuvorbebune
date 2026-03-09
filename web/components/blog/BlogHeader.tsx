'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function BlogHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  if (!mounted) return null

  return (
    <>
      <nav 
        className={`fixed w-full top-0 z-[110] transition-all duration-500 ${
          scrolled ? 'bg-white/30 backdrop-blur-md border-b border-white/20 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logonou1.png" alt="Logo" className="h-10 w-auto" />
              <span className="text-[15px] font-bold tracking-tighter text-stone-800 flex flex-col uppercase leading-none">
                <span>Grădina cu</span>
                <span className="-mt-[2px]">Vorbe Bune</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Blog
            </Link>
            <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Login
            </Link>
            <Link 
              href="/login?mode=signup" 
              className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 hover:scale-105 transition-all shadow-lg shadow-stone-900/20"
            >
              Începe Acum
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Meniu"
          >
            <svg 
              className="w-6 h-6 text-emerald-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 z-[109] md:hidden pt-[64px]"
          >
            <div className="bg-white border-t border-stone-100">
              <div className="flex flex-col p-6 gap-4">
                <Link 
                  href="/blog" 
                  className="text-lg font-medium text-stone-800 py-3 border-b border-stone-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/login" 
                  className="text-lg font-medium text-stone-800 py-3 border-b border-stone-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/login?mode=signup" 
                  className="bg-emerald-500 text-white px-6 py-3 rounded-full text-center font-medium mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Începe Acum
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
