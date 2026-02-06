'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBeneficiary } from '@/contexts/BeneficiaryContext'
import { User, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollableCarousel } from '@/components/ui/ScrollableCarousel'

const STORAGE_KEY = 'empatie_selected_beneficiary_id'

export function BeneficiaryBadge() {
  const { beneficiaries, selectedBeneficiary, setSelectedBeneficiary } = useBeneficiary()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isInitialMount, setIsInitialMount] = useState(true)

  const sortedBeneficiaries = [...beneficiaries].sort((a, b) => 
    a.first_name.localeCompare(b.first_name, 'ro')
  )

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (ageRange: string) => {
    const colors: Record<string, string> = {
      '8-10': 'bg-blue-100 text-blue-600',
      '11-13': 'bg-green-100 text-green-600',
      '14-16': 'bg-amber-100 text-amber-600',
      '17-20': 'bg-rose-100 text-rose-600',
    }
    return colors[ageRange] || 'bg-stone-100 text-stone-600'
  }

  const isSelected = (id: string) => selectedBeneficiary?.id === id

  const getBorderColor = (ageRange: string) => {
    const colors: Record<string, string> = {
      '8-10': 'border-l-blue-400',
      '11-13': 'border-l-green-400',
      '14-16': 'border-l-amber-400',
      '17-20': 'border-l-rose-400',
    }
    return colors[ageRange] || 'border-l-stone-400'
  }

  useEffect(() => {
    if (beneficiaries.length > 0) {
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId) {
        const beneficiary = beneficiaries.find(b => b.id === savedId)
        if (beneficiary) {
          setSelectedBeneficiary(beneficiary)
        }
      }
    }
  }, [beneficiaries, setSelectedBeneficiary])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !selectedBeneficiary) return

    const scroll = () => {
      const selectedEl = container.querySelector(`[data-beneficiary-id="${selectedBeneficiary.id}"]`) as HTMLElement
      if (!selectedEl) return

      const targetScrollPos = selectedEl.offsetLeft - container.offsetLeft
      container.scrollTo({
        left: targetScrollPos,
        behavior: isInitialMount ? 'auto' : 'smooth'
      })

      if (isInitialMount) {
        setIsInitialMount(false)
      }
    }

    const timeoutId = setTimeout(scroll, 50)
    return () => clearTimeout(timeoutId)
  }, [selectedBeneficiary?.id, isInitialMount])

  const handleSelect = (beneficiary: typeof beneficiaries[0]) => {
    if (isSelected(beneficiary.id)) {
      setSelectedBeneficiary(null)
      localStorage.removeItem(STORAGE_KEY)
    } else {
      setSelectedBeneficiary(beneficiary)
      localStorage.setItem(STORAGE_KEY, beneficiary.id)
      setIsInitialMount(false)
    }
  }

  if (beneficiaries.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium text-stone-600 mb-3 ml-1">Alege beneficiarul</h4>
        <ScrollableCarousel>
          <div className="min-w-[140px] glass-card p-3 rounded-xl border-l-4 border-l-amber-300 opacity-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-xs text-stone-600">Adaugă beneficiari</p>
            </div>
          </div>
        </ScrollableCarousel>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-stone-600 mb-3 ml-1">Alege beneficiarul</h4>
      <ScrollableCarousel className="group" showArrows={true}>
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
        >
          <AnimatePresence mode="popLayout">
            {sortedBeneficiaries.map((beneficiary) => (
              <motion.button
                key={beneficiary.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                data-beneficiary-id={beneficiary.id}
                onClick={() => handleSelect(beneficiary)}
                className={cn(
                  'min-w-[100px] glass-card p-3 rounded-xl border-l-4 flex flex-col items-center text-center transition-all flex-shrink-0',
                  isSelected(beneficiary.id)
                    ? 'border-l-stone-800 bg-white shadow-md'
                    : `${getBorderColor(beneficiary.age_range)} hover:bg-white/80`
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2',
                  getAvatarColor(beneficiary.age_range)
                )}>
                  {getInitials(beneficiary.first_name)}
                </div>
                <p className="text-xs font-semibold text-stone-800 truncate max-w-[90px]">
                  {beneficiary.first_name}
                </p>
                {isSelected(beneficiary.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-stone-800 flex items-center justify-center mt-1"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </ScrollableCarousel>
    </div>
  )
}
