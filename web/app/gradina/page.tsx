'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useModalOverlay } from '@/contexts/ModalOverlayContext'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const plantStages = [
  { level: 1, name: 'Sămânță', icon: 'solar:seed-linear', xpRange: '0-200 XP' },
  { level: 2, name: 'Răsad', icon: 'solar:sprout-linear', xpRange: '200-400 XP' },
  { level: 3, name: 'Plantă', icon: 'solar:plant-2-linear', xpRange: '400-600 XP' },
  { level: 4, name: 'Înflorire', icon: 'solar:flower-linear', xpRange: '600-800 XP' },
  { level: 5, name: 'Rodire', icon: 'solar:tree-falling-leaf-linear', xpRange: '800-1000 XP' },
  { level: 6, name: 'Grădinar al Sufletului', icon: 'solar:crown-star-linear', xpRange: '1000+ XP' },
]

function getPlantStage(xp: number): typeof plantStages[number] {
  if (xp >= 1000) return plantStages[5]
  if (xp >= 800) return plantStages[4]
  if (xp >= 600) return plantStages[3]
  if (xp >= 400) return plantStages[2]
  if (xp >= 200) return plantStages[1]
  return plantStages[0]
}

function PlantVisualizer({ xp }: { xp: number }) {
  const currentStage = getPlantStage(xp)
  const progress = xp % 200

  const plantImages = [
    '/images/plant/samanta.png',
    '/images/plant/rasad.png',
    '/images/plant/planta.png',
    '/images/plant/inflorire.png',
    '/images/plant/rodire.png',
    '/images/plant/gradinar.png',
  ]

  const imageIndex = currentStage.level - 1
  const currentImage = plantImages[Math.min(imageIndex, plantImages.length - 1)]

  const plantSizes: Record<number, { width: number; height: number }> = {
    1: { width: 180, height: 180 },
    2: { width: 180, height: 180 },
    3: { width: 120, height: 120 },
    4: { width: 100, height: 100 },
    5: { width: 140, height: 140 },
    6: { width: 105, height: 105 },
  }

  const size = plantSizes[currentStage.level] || { width: 180, height: 180 }

  return (
    <div className="relative z-10 h-64 flex items-end justify-center mb-8">
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(
          'transition-all duration-1000',
          currentStage.level >= 4 && 'animate-glow'
        )}
      >
        <Image
          src={currentImage}
          alt={currentStage.name}
          width={size.width}
          height={size.height}
          className="object-contain"
          priority
          unoptimized
        />
      </motion.div>
      
      {/* Stage glow effect */}
      {currentStage.level >= 3 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-300/20 rounded-full blur-[50px]" />
      )}
    </div>
  )
}

export default function GradinaPage() {
  const { profile } = useAuth()
  const { setModalOpen } = useModalOverlay()
  const [mounted, setMounted] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setModalOpen(false)
  }, [setModalOpen])

  useEffect(() => {
    setModalOpen(showInfoModal)
  }, [showInfoModal, setModalOpen])

  const xp = profile?.total_xp || 0
  const currentStage = getPlantStage(xp)
  const nextLevelXp = currentStage.level < 6 ? currentStage.level * 200 : 1200
  const progress = currentStage.level === 6 ? 100 : ((xp - (currentStage.level - 1) * 200) / 200) * 100
  const messagesToNextLevel = currentStage.level === 6 ? 0 : Math.ceil((nextLevelXp - xp) / 25)

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded mb-2" />
        <div className="h-6 w-64 bg-stone-200 rounded mb-8" />
        <div className="h-40 bg-stone-200 rounded-3xl mb-6" />
        <div className="space-y-4">
          <div className="h-20 bg-stone-200 rounded-2xl" />
          <div className="h-20 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-800 mb-1">
            Grădina.
          </h2>
          <p className="text-stone-500 font-light text-sm">Sistemul tău de evoluție personală.</p>
        </div>
        <button onClick={() => setShowInfoModal(true)} className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors">
          <iconify-icon icon="solar:info-circle-linear" width="20" />
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <iconify-icon icon="solar:crown-star-linear" width="24" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Grad Actual</p>
            <p className="text-sm font-semibold text-stone-800">{currentStage.name}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <iconify-icon icon="solar:fire-bold" width="24" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Serie Activă</p>
            <p className="text-sm font-semibold text-stone-800">{profile?.streak_count || 12} Zile</p>
          </div>
        </div>
      </div>

      {/* Main Visualization Card */}
      <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden text-center mb-6 border border-white/60 shadow-xl shadow-green-100/20">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-50/30 to-green-100/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-300/20 rounded-full blur-[50px] animate-pulse" />

        {/* Level Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white text-sm font-semibold text-stone-800 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Nivel {currentStage.level}: {currentStage.name}
        </div>

        {/* The Plant */}
        <PlantVisualizer xp={xp} />

        {/* XP Progress */}
        <div className="relative z-10 max-w-sm mx-auto">
          <div className="flex justify-between text-xs font-medium text-stone-500 mb-2">
            <span>XP Acumulat: {xp}</span>
            <span>Țintă: {currentStage.level === 6 ? 'MAX' : `${nextLevelXp} XP`}</span>
          </div>
          <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
          {currentStage.level < 6 && (
            <p className="text-xs text-stone-400 mt-3 font-light">
              Trimite încă <span className="text-stone-700 font-medium">{messagesToNextLevel} mesaje</span> pentru a evolua la stadiul de &quot;{plantStages[currentStage.level].name}&quot;.
            </p>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Cum funcționează evoluția?</h3>
        <ul className="space-y-3 text-sm text-stone-600">
          <li className="flex gap-2">
            <iconify-icon icon="solar:bolt-circle-linear" class="text-blue-500 mt-0.5" width="18" />
            <span><strong>10 XP</strong> pentru fiecare mesaj trimis</span>
          </li>
          <li className="flex gap-2">
            <iconify-icon icon="solar:fire-bold" class="text-orange-500 mt-0.5" width="18" />
            <span>Evoluezi la fiecare <strong>200 XP</strong> (~20 mesaje)</span>
          </li>
          <li className="flex gap-2">
            <iconify-icon icon="solar:leaf-bold" class="text-green-500 mt-0.5" width="18" />
            <span>6 niveluri: <strong>Sămânță</strong> → <strong>Răsad</strong> → <strong>Plantă</strong> → <strong>Înflorire</strong> → <strong>Rodire</strong> → <strong>Grădinar al Sufletului</strong></span>
          </li>
          <li className="flex gap-2">
            <iconify-icon icon="solar:star-linear" class="text-amber-500 mt-0.5" width="18" />
            <span>Serie activă: trimite zilnic pentru a-ți menține streak-ul</span>
          </li>
        </ul>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-lg bg-[#FAFAF9] rounded-[32px] p-6 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-stone-800">
                Cum funcționează evoluția?
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="mt-0.5 min-w-[20px] text-blue-500">
                    <iconify-icon icon="solar:bolt-circle-linear" width="20" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">Mesaj = Energie (XP)</p>
                    <p className="text-xs text-stone-500 leading-relaxed">Fiecare mesaj trimis este o unitate de energie pozitivă care hrănește ecosistemul.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="mt-0.5 min-w-[20px] text-green-500">
                    <iconify-icon icon="solar:sprout-linear" width="20" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">Planta ca Oglindă</p>
                    <p className="text-xs text-stone-500 leading-relaxed">Planta reacționează vizual la efortul tău. Consistența o face să înflorească.</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-stone-200">
                <p className="text-xs text-stone-400">
                  Trimite mesaje în fiecare zi pentru a-ți menține seria activă și a-ți ajuta planta să evolueze.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
