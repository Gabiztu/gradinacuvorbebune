'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [key, setKey] = useState(pathname)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => {
      setKey(pathname)
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      key={key}
      className={`transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
